// enum for a list of color names
export enum ColorNames {
	RED = "red",
	RED_LIGHT = "red_light",
	ORANGE = "orange",
	ORANGE_LIGHT = "orange_light",
	YELLOW = "yellow",
	YELLOW_LIGHT = "yellow_light",
	LIME = "lime",
	LIME_LIGHT = "lime_light",
	GREEN = "green",
	GREEN_LIGHT = "green_light",
	TEAL = "teal",
	TEAL_LIGHT = "teal_light",
	BLUE = "blue",
	BLUE_LIGHT = "blue_light",
	PURPLE = "purple",
	PURPLE_LIGHT = "purple_light",
	PINK = "pink",
	PINK_LIGHT = "pink_light",
	WHITE = "white",
	GREY_LIGHT = "grey_light",
	GREY_DARK = "grey_dark",
	BLACK = "black"
}

export const ColorDefs = {
	[ColorNames.RED]: {
		name: ColorNames.RED,
		hex: "#E34545"
	},
	[ColorNames.RED_LIGHT]: {
		name: ColorNames.RED_LIGHT,
		hex: "#EE8E8E"
	},
	[ColorNames.ORANGE]: {
		name: ColorNames.ORANGE,
		hex: "#F89941"
	},
	[ColorNames.ORANGE_LIGHT]: {
		name: ColorNames.ORANGE_LIGHT,
		hex: "#F9BE87"
	},
	[ColorNames.YELLOW]: {
		name: ColorNames.YELLOW,
		hex: "#F4BC41"
	},
	[ColorNames.YELLOW_LIGHT]: {
		name: ColorNames.YELLOW_LIGHT,
		hex: "#F8DCA0"
	},
	[ColorNames.LIME]: {
		name: ColorNames.LIME,
		hex: "#9FC10B"
	},
	[ColorNames.LIME_LIGHT]: {
		name: ColorNames.LIME_LIGHT,
		hex: "#DDF473"
	},
	[ColorNames.GREEN]: {
		name: ColorNames.GREEN,
		hex: "#0DB515"
	},
	[ColorNames.GREEN_LIGHT]: {
		name: ColorNames.GREEN_LIGHT,
		hex: "#76F17C"
	}, // inferred light green based on image; not in Figma list
	[ColorNames.TEAL]: {
		name: ColorNames.TEAL,
		hex: "#1FA7DD"
	},
	[ColorNames.TEAL_LIGHT]: {
		name: ColorNames.TEAL_LIGHT,
		hex: "#75D1F5"
	},
	[ColorNames.BLUE]: {
		name: ColorNames.BLUE,
		hex: "#2C60D3"
	},
	[ColorNames.BLUE_LIGHT]: {
		name: ColorNames.BLUE_LIGHT,
		hex: "#86A8F4"
	},
	[ColorNames.PURPLE]: {
		name: ColorNames.PURPLE,
		hex: "#984CE3"
	},
	[ColorNames.PURPLE_LIGHT]: {
		name: ColorNames.PURPLE_LIGHT,
		hex: "#CEABF0"
	},
	[ColorNames.PINK]: {
		name: ColorNames.PINK,
		hex: "#E859C4"
	},
	[ColorNames.PINK_LIGHT]: {
		name: ColorNames.PINK_LIGHT,
		hex: "#F6BBE7"
	},
	[ColorNames.WHITE]: {
		name: ColorNames.WHITE,
		hex: "#FFFFFF"
	},
	[ColorNames.GREY_LIGHT]: {
		name: ColorNames.GREY_LIGHT,
		hex: "#A8A8A8"
	},
	[ColorNames.GREY_DARK]: {
		name: ColorNames.GREY_DARK,
		hex: "#545454"
	},
	[ColorNames.BLACK]: {
		name: ColorNames.BLACK,
		hex: "#000000"
	}
} as const;

type ColorDefsType = typeof ColorDefs;
export type { ColorDefsType };
