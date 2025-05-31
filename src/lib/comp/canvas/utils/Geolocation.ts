type Coordinates = { latitude: number; longitude: number; accuracy: number };

// Canvas-related types moved here to consolidate location functionality
export interface NearbyCanvas {
    id: string;
    title: string;
    loc_desc: string;
    backup_code: string;
    distance_mi: number;
    latitude: number;
    longitude: number;
    created_on: string;
}

type GetCurrentPosResult = {
    location: GeolocationPosition | null;
    status: number;
};

interface LocationConfig {
    mobile: {
        distanceThreshold: number;
        timeThreshold: number;
        geoOptions: PositionOptions;
    };
    desktop: {
        distanceThreshold: number;
        timeThreshold: number;
        refreshInterval: number;
        geoOptions: PositionOptions;
    };
}

const DEFAULT_CONFIG: LocationConfig = {
    mobile: {
        distanceThreshold: 100, // meters
        timeThreshold: 30000, // 30 seconds
        geoOptions: {
            enableHighAccuracy: true,
            maximumAge: 60000,
            timeout: 15000
        }
    },
    desktop: {
        distanceThreshold: 500, // meters
        timeThreshold: 30000, // 30 seconds
        refreshInterval: 300000, // 5 minutes
        geoOptions: {
            enableHighAccuracy: false,
            maximumAge: 300000,
            timeout: 10000
        }
    }
};

type LocationTrackingOptions = {
    onLocationUpdate: (lat: number, lon: number) => Promise<void> | void;
    onError: (error: string) => Promise<void> | void;
    config?: Partial<LocationConfig>;
};

type WatchState =
    | { type: "geolocation"; id: number }
    | { type: "interval"; id: number | NodeJS.Timeout }
    | null;

export const isMobileDevice = (): boolean => {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        /Mobi|Android/i.test(navigator.userAgent)
    );
};

class LocationTracker {
    private watchState: WatchState = null;
    private lastKnownLocation: { lat: number; lon: number } | null = null;
    private lastUpdateTime = 0;
    private readonly options: LocationTrackingOptions;
    private readonly platformConfig: LocationConfig['mobile'] | LocationConfig['desktop'];

    constructor(options: LocationTrackingOptions) {
        this.options = options;
        const isMobile = isMobileDevice();

        const config = {
            mobile: { ...DEFAULT_CONFIG.mobile, ...options.config?.mobile },
            desktop: { ...DEFAULT_CONFIG.desktop, ...options.config?.desktop }
        };
        this.platformConfig = isMobile ? config.mobile : config.desktop;
    }

    private shouldUpdateLocation(lat: number, lon: number): boolean {
        const now = Date.now();

        if (now - this.lastUpdateTime < this.platformConfig.timeThreshold) {
            return false;
        }

        if (this.lastKnownLocation) {
            const distanceMoved = calculateDistanceBetweenCoordinates(
                this.lastKnownLocation.lat,
                this.lastKnownLocation.lon,
                lat,
                lon
            );
            return distanceMoved >= this.platformConfig.distanceThreshold;
        }

        return true;
    }

    private handleLocationUpdate = async (position: GeolocationPosition): Promise<void> => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (!this.shouldUpdateLocation(lat, lon)) {
            return;
        }

        this.lastKnownLocation = { lat, lon };
        this.lastUpdateTime = Date.now();

        await this.options.onLocationUpdate(lat, lon);
    };

    async startTracking(): Promise<{ success: boolean; error?: string }> {
        this.stopTracking();

        const initialResult = await fetchCoordinatesForDisplay();
        if (initialResult.status !== 0 || !initialResult.location) {
            return { success: false, error: "Unable to get your current location" };
        }

        this.lastKnownLocation = {
            lat: initialResult.location.latitude,
            lon: initialResult.location.longitude
        };
        this.lastUpdateTime = Date.now();

        await this.options.onLocationUpdate(
            initialResult.location.latitude,
            initialResult.location.longitude
        );

        if ("geolocation" in navigator) {
            if ('refreshInterval' in this.platformConfig) {
                this.startDesktopTracking();
            } else {
                this.startMobileTracking();
            }
        }

        return { success: true };
    }

    private startMobileTracking(): void {
        const watchId = navigator.geolocation.watchPosition(
            this.handleLocationUpdate,
            async (error) => {
                let message = "Location tracking stopped working";
                switch (error.code) {
                    case GeolocationPositionError.PERMISSION_DENIED:
                        message = "Location access was denied. Enable it in your browser settings.";
                        break;
                    case GeolocationPositionError.POSITION_UNAVAILABLE:
                        message = "Location unavailable. Check your device settings.";
                        break;
                    case GeolocationPositionError.TIMEOUT:
                        message = "Location request timed out. Try again in a moment.";
                        break;
                }
                await this.options.onError(message);
            },
            this.platformConfig.geoOptions
        );

        this.watchState = { type: "geolocation", id: watchId };
    }

    private startDesktopTracking(): void {
        const refreshDesktopLocation = () => {
            navigator.geolocation.getCurrentPosition(
                this.handleLocationUpdate,
                async (error) => {
                    let message = "Unable to refresh your location";
                    switch (error.code) {
                        case GeolocationPositionError.PERMISSION_DENIED:
                            message = "Location access was denied. Enable it in your browser settings.";
                            break;
                        case GeolocationPositionError.POSITION_UNAVAILABLE:
                            message = "Location unavailable. Check your device settings.";
                            break;
                        case GeolocationPositionError.TIMEOUT:
                            message = "Location request timed out. Try again in a moment.";
                            break;
                    }
                    await this.options.onError(message);
                },
                this.platformConfig.geoOptions
            );
        };

        const intervalId = setInterval(refreshDesktopLocation, (this.platformConfig as LocationConfig['desktop']).refreshInterval);
        this.watchState = { type: "interval", id: intervalId };
    }

    stopTracking(): void {
        if (this.watchState) {
            if (this.watchState.type === "geolocation") {
                navigator.geolocation.clearWatch(this.watchState.id);
            } else {
                clearInterval(this.watchState.id);
            }
            this.watchState = null;
        }
    }

    resetTracking(): void {
        this.lastKnownLocation = null;
        this.lastUpdateTime = 0;
    }

    getTrackingInfo() {
        return {
            isMobile: 'refreshInterval' in this.platformConfig === false,
            isTracking: this.watchState !== null,
            lastKnownLocation: this.lastKnownLocation,
            lastUpdateTime: this.lastUpdateTime,
            config: this.platformConfig
        };
    }
}

export const createLocationTracker = (options: LocationTrackingOptions): LocationTracker => {
    return new LocationTracker(options);
};

export const formatDistance = (miles: number): string => {
    if (miles < 0.1) {
        return `${Math.round(miles * 5280)} ft away`;
    } else if (miles < 10) {
        return `${miles.toFixed(1)} mi away`;
    } else {
        return `${Math.round(miles)} mi away`;
    }
};

export const calculateDistanceBetweenCoordinates = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getCurrentPos = async (): Promise<GetCurrentPosResult> => {
    if (!("geolocation" in navigator)) {
        return { location: null, status: 2 };
    }

    if ("permissions" in navigator) {
        try {
            const { state } = await navigator.permissions.query({ name: "geolocation" });
            if (state === "denied") {
                return { location: null, status: 1 };
            }
        } catch {
            // ignore and proceed
        }
    }

    return new Promise<GetCurrentPosResult>((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ location: position, status: 0 }),
            (error) => resolve({ location: null, status: error.code }),
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 0 }
        );
    });
};

export const fetchCoordinatesForDisplay = async (): Promise<{
    location: Coordinates | null;
    status: number;
}> => {
    const { location, status } = await getCurrentPos();

    if (status !== 0) {
        switch (status) {
            case GeolocationPositionError.PERMISSION_DENIED:
                alert("Location access was denied. Enable it in your browser settings.");
                break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
                alert(
                    "Location access unavailable. Are you on a device that supports geolocation?"
                );
                break;
            case GeolocationPositionError.TIMEOUT:
                alert("Location access timed out. Try again in a bit.");
                break;
            default:
                alert("Idk what happened but something is very wrong. Please try again later.");
        }
        return {
            location: null,
            status: status
        };
    }

    if (location) {
        return {
            location: {
                latitude: roundCoordinate(location.coords.latitude),
                longitude: roundCoordinate(location.coords.longitude),
                accuracy: location.coords.accuracy
            },
            status: 0
        };
    } else {
        return {
            location: null,
            status: status
        };
    }
};

export const roundCoordinate = (num: number, decimalPlaces: number = 7): number => {
    if (isNaN(num) || !isFinite(num)) return num;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
};

export const isDisplayableMapCoordinate = (lat?: number, lng?: number): boolean => {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat !== 0 &&
        lng !== 0
    );
};

export const parseCoordinateString = (
    coordString: string
): { latitude: number; longitude: number; isValid: boolean } => {
    if (!coordString || coordString.trim() === "") {
        return { latitude: NaN, longitude: NaN, isValid: false };
    }

    const parts = coordString.trim().split(",");
    if (parts.length !== 2) {
        return { latitude: NaN, longitude: NaN, isValid: false };
    }

    const [latStr, longStr] = parts.map((s) => s.trim());
    const latitude = Number(latStr);
    const longitude = Number(longStr);

    const isValid =
        isFinite(latitude) &&
        isFinite(longitude) &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180;

    return { latitude, longitude, isValid };
};

export const formatCoordinateString = (latitude: number, longitude: number): string => {
    if (!isFinite(latitude) || !isFinite(longitude)) {
        return "";
    }
    return `${roundCoordinate(latitude)}, ${roundCoordinate(longitude)}`;
};

export const areCoordinatesEqual = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): boolean => {
    return (
        roundCoordinate(lat1) === roundCoordinate(lat2) &&
        roundCoordinate(lng1) === roundCoordinate(lng2)
    );
};

export const validateCoordinates = (
    latitude: number,
    longitude: number,
    options?: {
        allowDefault?: boolean;
        defaultCoords?: { lat: number; lng: number };
    }
): { isValid: boolean; reason?: string } => {
    const { allowDefault = false, defaultCoords = { lat: 0, lng: 0 } } = options || {};

    if (!isDisplayableMapCoordinate(latitude, longitude)) {
        return { isValid: false, reason: "Invalid coordinate values" };
    }

    if (
        !allowDefault &&
        areCoordinatesEqual(latitude, longitude, defaultCoords.lat, defaultCoords.lng)
    ) {
        return { isValid: false, reason: "Coordinates cannot be default location" };
    }

    return { isValid: true };
};
