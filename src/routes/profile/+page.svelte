<script lang="ts">
	import CanvasCard from "$lib/comp/profile/CanvasCard.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	// get session and user from the page data
	let session = $derived(data.session);
	let user = $derived(data.user);

	let localUser = user;
	let localDisplayName = $derived(localUser?.profile?.displayName ?? "");
	let localBio = $derived(localUser?.profile?.bio ?? "");

	const dummyCanvas = [
		{
			id: "1",
			name: "My Canvas",
			loc: "Engineering 2",
			createdOn: new Date()
		},
		{
			id: "2",
			name: "Frog",
			loc: "Cowell",
			createdOn: new Date()
		}
	];

	// to be replaced with user data from db (will get from SSR)
	let canvases = $state(dummyCanvas); // obj type

	// toggle between Profile | Canvases tab
	let isProfile = $state(true);
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<section id="title-container">
			<h2 id="title"><span>Greetings,</span><br />{localDisplayName}.</h2>
			{#if user}
				<img id="pfp" src={user.profile.avatarUrl} alt="Profile Picture" />
			{/if}
		</section>
		<p id="desc">You can edit your profile or manage your canvases here.</p>
	</section>

	<!-- toggle tabs -->
	<section id="tabs-cta">
		<button class={!isProfile ? "outline" : ""} onclick={() => (isProfile = true)}>
			Profile
		</button>
		<button class={isProfile ? "outline" : ""} onclick={() => (isProfile = false)}>
			Canvases
		</button>
	</section>

	<section id="edit-content">
		{#if isProfile}
			<!-- profile render -->
			<form method="POST" action="?/update_profile" id="profile_form">
				<label>
					<p class="caption">Display Name</p>
					<input
						name="disp-name"
						type="text"
						placeholder="Guy"
						bind:value={localDisplayName}
					/>
				</label>

				<label>
					<p class="caption">Bio</p>
					<textarea
						name="bio"
						placeholder="I'm just a chill guy."
						rows="3"
						value={localBio}
					></textarea>
				</label>

				<button>Save</button>
			</form>
		{:else}
			<!-- canvases list render -->
			<div class="canvas_list">
				{#each canvases as canvas}
					<CanvasCard {canvas} />
				{/each}
			</div>
		{/if}
	</section>

	<p>
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi, aspernatur odio. Totam a vero
		officiis dolores cum ducimus quod temporibus culpa necessitatibus? Tenetur dicta, laborum
		placeat labore accusamus facilis similique. Aperiam, eveniet incidunt obcaecati quae, eaque
		fugiat illum quidem consequuntur voluptatum ad minima ipsam nulla, maiores possimus
		blanditiis quibusdam fuga dolorum. Aut facilis inventore eveniet ipsum porro? Porro,
		excepturi magni. Magni voluptate porro quibusdam ipsam doloribus! Repellendus facilis
		voluptate numquam blanditiis, qui provident corrupti laborum officia iste pariatur
		doloremque harum repudiandae quae sint nisi cumque enim facere. Repellendus, fuga commodi!
		Amet ut, nemo saepe omnis, maiores impedit earum repellendus ratione, quibusdam ea et dolore
		explicabo! Illo veniam similique eos sequi. Est numquam cumque quisquam impedit! Nihil totam
		facilis facere sit! Eaque libero reprehenderit, omnis adipisci alias sequi illo voluptas
		exercitationem repellat earum rerum quasi qui explicabo ipsam aliquam, modi excepturi labore
		velit, minus voluptatum atque saepe. Ullam sed suscipit hic. Accusamus eligendi in ullam
		possimus, iure, quaerat quibusdam quis qui necessitatibus distinctio mollitia error. Illo
		eveniet eum sapiente deleniti cupiditate in numquam eligendi dignissimos corrupti.
		Reprehenderit necessitatibus aliquam est alias? A fugit eveniet quisquam ut repellat
		delectus dolores dolor accusamus ad dolore odio dolorem molestias culpa doloremque doloribus
		perspiciatis cumque, sunt aperiam suscipit libero veritatis obcaecati? Cumque quo maiores
		modi! Reprehenderit nostrum odio natus! Corrupti, iure accusamus. Beatae, molestiae vero
		facere suscipit omnis natus soluta quos qui doloribus officiis, odio veritatis amet minus
		ratione explicabo veniam dolores? Tenetur, corporis consectetur? Possimus voluptas omnis vel
		asperiores quis autem sapiente, esse minus officia tenetur animi dolore dicta doloribus
		ullam quas alias praesentium voluptates voluptatibus. Architecto earum aut similique
		expedita, quisquam dolores sint. Consequatur consequuntur vel recusandae! Eligendi
		asperiores a recusandae, minus, itaque maxime blanditiis nihil eaque unde sapiente, nostrum
		animi praesentium cupiditate voluptate eius modi rem minima pariatur tempora. Dolor,
		laboriosam unde. Debitis, nulla? Quod blanditiis voluptates, cumque voluptate, cupiditate
		architecto eaque tenetur quos esse eius placeat reiciendis. Quia eius distinctio voluptas,
		libero sit dolorum? Omnis, laboriosam reprehenderit praesentium at non illo! Nam laudantium
		non pariatur! Rerum, dicta, totam earum molestias voluptates minima quidem quam tempora ab
		quae itaque corrupti excepturi porro perspiciatis dolore animi sunt dignissimos aut eaque.
		Libero, reprehenderit minus. Delectus, odio aut laudantium soluta molestias ullam ipsum
		esse, aliquam similique, modi officiis animi earum tempora consequuntur adipisci dolores
		maxime fugit quasi eligendi nobis quibusdam ex. Similique deserunt aliquid laboriosam?
		Aliquam nihil porro autem omnis assumenda eum, expedita pariatur impedit amet officiis
		accusamus repellendus iure nobis facere quae. Similique consectetur aperiam fuga iure
		pariatur vel officia quia quam porro facere! Corrupti unde quidem architecto tenetur et
		similique accusantium tempora sequi delectus quibusdam dolores, culpa, placeat eveniet aut
		saepe? Omnis est quis, non possimus distinctio nisi quibusdam quisquam cupiditate ullam
		repellendus? Veritatis quisquam accusantium magnam molestias eum, ullam perferendis
		asperiores consectetur sequi, culpa saepe rem tempore alias omnis repudiandae ea a quidem,
		recusandae quibusdam voluptatibus. Ipsa dignissimos nam quia sit commodi. Quidem itaque non
		beatae ad? Eveniet ut quia cumque dolorum accusantium repudiandae tempora voluptatem aliquam
		laborum nisi aut laboriosam qui aspernatur, quos enim possimus velit a ducimus alias est
		iste. Quia ullam consequatur beatae quam facere sit quo, praesentium quas atque molestias
		modi culpa reprehenderit eveniet temporibus voluptatem maiores. Libero ut eligendi hic rerum
		porro maiores numquam facere dolore? Voluptas? Nisi corrupti repellendus adipisci deleniti
		molestias omnis? Dolores, tempora. Quod omnis blanditiis incidunt ratione eum impedit quo
		inventore voluptate maxime? Dolores ipsam exercitationem ipsa corrupti asperiores sunt eaque
		fugiat facere. Magni voluptatem tenetur debitis, recusandae hic sit quod magnam nesciunt
		officia dolores asperiores unde veniam ad quia voluptate, est quaerat accusantium temporibus
		odit expedita. Similique minus libero odio reiciendis earum? Ducimus voluptatem explicabo in
		fuga nulla cupiditate quos, id quia, doloremque praesentium odio quis labore! Distinctio,
		rerum. Officia, doloremque? Laborum a excepturi sunt voluptas quam ex nulla architecto modi
		nobis? Ex voluptatum quibusdam ratione id sunt facere, nisi distinctio ducimus placeat illum
		optio consequuntur similique asperiores nam dicta repudiandae! Sapiente, dolores! Deleniti,
		sunt explicabo! Ipsam ullam architecto repellat eius rem! Hic inventore reprehenderit, a
		vitae nobis distinctio maiores eligendi obcaecati rerum beatae vero, quo molestias, dolor
		maxime delectus! Autem nisi odit iste exercitationem esse. Ea dolore omnis labore error
		necessitatibus? Dolorem rem ea fuga nemo saepe nobis esse excepturi quisquam possimus. Culpa
		magnam molestiae labore harum nulla incidunt, recusandae vel dolor velit pariatur ab
		voluptatum odio blanditiis et numquam placeat! Minima quam similique, autem optio voluptate
		nesciunt, dolor quis tempore officiis amet obcaecati culpa repellat ex. Animi,
		necessitatibus vitae quia provident facere eveniet odio asperiores! Dolorem quae accusantium
		laborum odit. Soluta facere, iusto repudiandae, error earum nam facilis officia sunt dolor
		deleniti eveniet temporibus sapiente? Culpa illum qui earum voluptatum nisi totam dicta?
		Neque in perferendis quibusdam quidem quisquam porro! Beatae, culpa? Totam, incidunt.
		Quisquam voluptatem eius placeat provident officiis animi autem suscipit assumenda atque
		illo? Quo ipsum velit, soluta ducimus sequi a voluptatum consequuntur! Asperiores ex ad
		dicta similique? Quasi architecto reprehenderit, sit provident, veniam aperiam veritatis hic
		praesentium libero optio quia, velit cum nam sint minus nihil. Culpa eaque pariatur officia
		hic cum dignissimos porro iste labore repudiandae. Fugiat eum dolor exercitationem. Dolorem
		accusamus iusto commodi necessitatibus esse sunt consequatur, facilis amet optio sapiente
		ratione hic rem illum at aliquam cupiditate nemo. Dolore facere rerum nisi vel qui. Suscipit
		fuga quas optio quaerat tenetur facere laudantium, doloribus aliquid nobis repellat nam
		aspernatur sunt asperiores similique, harum nesciunt accusantium ab! Aut provident dolor
		odit praesentium nulla iusto debitis modi! Nobis similique quidem cumque aperiam nesciunt.
		Magnam, maiores. Amet, eos repellat ipsam error dolorum qui quis ducimus quas, ex corrupti
		ipsum optio necessitatibus rerum nemo neque at? Tenetur, doloremque ipsam. Nulla maxime
		voluptas deleniti ut sequi odio itaque assumenda, mollitia unde repudiandae eius quidem,
		consectetur commodi omnis voluptate ipsam. Nulla, numquam nihil? Debitis, est. Ut
		accusantium nisi aliquam non itaque! Ea aliquid praesentium quisquam voluptatum voluptas ad
		dicta non, quam tempore? Ab at est animi totam consequuntur assumenda ullam impedit, earum
		perferendis placeat, architecto vitae odit quae ad, suscipit laborum. Dolorum earum
		doloremque quisquam accusantium repellat vitae totam nihil, sint necessitatibus maiores
		iusto officia beatae dignissimos at ratione nostrum aut ipsam. Assumenda facere perferendis
		expedita odit, eligendi temporibus nesciunt esse? Earum vitae minus sapiente ab, rem sequi
		nesciunt voluptate eveniet ratione exercitationem fugit in corporis a repudiandae,
		perspiciatis esse voluptatibus repellendus odio omnis minima aspernatur velit fuga.
		Mollitia, maxime enim! Magni ducimus impedit explicabo praesentium reprehenderit
		exercitationem, porro unde maxime deserunt? Distinctio, facere doloribus natus cupiditate
		neque ipsa, laudantium rem corrupti tempore illum molestias, odit veniam deserunt eveniet
		cumque temporibus? Nisi, nulla repellendus veritatis nihil alias maiores quam ullam
		consequuntur pariatur neque expedita velit ad doloremque, voluptatum reiciendis nobis ut
		voluptatem dolore assumenda aliquid nam. Voluptatibus aliquid voluptatem dolores adipisci!
		Obcaecati rerum deleniti culpa eius sed fugit nihil, suscipit eligendi excepturi veniam
		architecto fuga sint libero voluptate fugiat dolore eos porro voluptates accusamus in
		consequuntur vel quibusdam? Saepe, minima esse. Natus, ab sed alias magni autem aperiam fuga
		eligendi aspernatur at corporis voluptatem mollitia officiis quod illum distinctio,
		consectetur dolor quae commodi labore explicabo harum id cupiditate sit minima. Quidem!
		Aliquid doloremque iusto ad asperiores laudantium mollitia suscipit cumque explicabo saepe
		eos, accusantium animi laboriosam nihil eaque ab quia minima ipsa. Ipsam porro blanditiis
		nobis quibusdam totam, quaerat delectus veniam? Beatae culpa quasi, possimus id quo qui quis
		nemo excepturi animi ullam pariatur odio tempore natus dolor repudiandae consequuntur sequi
		quidem laboriosam asperiores et. Eaque impedit illum repellendus dicta nemo. At id quidem
		illo fugit iusto voluptatibus molestias dolore adipisci temporibus maxime itaque suscipit
		delectus soluta rem, doloribus voluptates! Temporibus fugit dicta odit velit vero
		exercitationem voluptatum quos in quam! Non quos harum quia temporibus neque ex laudantium,
		aspernatur cupiditate. Labore nihil doloremque asperiores delectus, animi ab id accusantium
		ullam omnis veritatis provident recusandae voluptas nostrum. Corrupti excepturi repellendus
		deserunt? Ratione voluptatem reiciendis debitis ipsam eum quisquam, nulla qui illo quo,
		sequi accusantium id molestias. A inventore repudiandae debitis possimus iste magni, sequi
		alias, harum necessitatibus impedit eligendi deleniti! Aperiam? Repellendus vel nobis minus
		velit dolore nisi mollitia consequuntur laborum eos doloribus, eligendi ipsam soluta
		perspiciatis illum esse quaerat vero maiores. Culpa debitis sapiente esse tempora facilis
		placeat doloribus beatae. Consectetur corporis molestias maxime porro earum nesciunt
		aspernatur iste, minus quaerat minima unde laborum soluta veritatis quisquam distinctio,
		est, qui molestiae veniam officia provident reiciendis accusamus blanditiis vel.
		Accusantium, mollitia! Numquam facere quod quibusdam quaerat alias quo, fugit sed suscipit
		doloremque eveniet incidunt laudantium tempora nulla, voluptatibus iure tenetur molestiae
		cum voluptate! Quos ducimus accusantium provident in quisquam? Aliquam, libero. Ipsam modi
		natus, dolor sunt ex dicta laboriosam praesentium, mollitia, minus nam repudiandae
		reprehenderit! Minima velit ipsa tempore. Nihil aut aliquam explicabo esse veniam cumque
		unde harum ut fuga quas? Ipsam, accusantium reprehenderit suscipit ex ad vel saepe eligendi
		sint tempora? Architecto sequi natus laborum vel quam, deleniti quas quo quia incidunt
		eveniet aliquid quod et dolores voluptatem asperiores ipsam? Esse possimus neque vitae
		facilis obcaecati doloribus veritatis quasi architecto, necessitatibus sunt beatae,
		temporibus atque at consequatur repellendus! Nemo praesentium, enim quod dignissimos est
		sapiente ad neque vero corporis tempore. Dolorem dignissimos nisi eos ab voluptate
		consequatur, minima necessitatibus sed autem perferendis sint veniam et nobis dolor ducimus,
		repellat, voluptas eaque quo eius perspiciatis maxime quas ipsa. Eaque, temporibus
		necessitatibus? Numquam delectus, at ratione labore quam nesciunt temporibus harum adipisci
		veniam nemo ipsa rerum repudiandae. Quis officiis dolorum ut magnam unde necessitatibus
		asperiores eveniet, nam temporibus velit exercitationem architecto saepe. Temporibus, velit
		odit quod veniam nesciunt eum mollitia fugiat ducimus assumenda ratione voluptatem quibusdam
		pariatur, ab rem cupiditate dolorum iste tenetur, ad molestias nobis quae voluptates vitae
		cumque hic! Itaque! Ipsam repellendus suscipit odit autem repudiandae maxime laboriosam
		eveniet iste corrupti atque, alias illo nemo obcaecati ut nostrum tempore omnis, earum
		assumenda mollitia voluptatum velit. Mollitia laudantium harum non temporibus? Est labore,
		blanditiis enim quam animi voluptates eaque dolorum! Impedit corporis expedita animi ipsa,
		dolore maxime blanditiis, sint provident, repudiandae id temporibus quis fuga quod eligendi
		illo quos pariatur rem! Sapiente ipsa, nihil necessitatibus maxime aut quo consectetur eius
		eos veniam modi quia deserunt doloremque illum est officiis sequi iure. Repellat ipsam ex
		accusamus debitis nemo tempore. Vero, nostrum ab? Pariatur facere sit, omnis porro sunt
		assumenda illo accusantium natus. Repellat, repudiandae? Voluptatem voluptate distinctio
		velit saepe! Totam tenetur, aspernatur eum quasi, dolore possimus voluptatibus consectetur
		repudiandae maxime omnis obcaecati. Ratione magnam deleniti accusantium sint, rem mollitia
		unde velit ea nesciunt iusto repudiandae illum cum numquam dicta voluptates aspernatur
		officia aut nihil? Magnam, earum magni aliquid explicabo unde asperiores dicta! Laborum,
		aliquam. Nam minima dolor dolorum accusantium est? Numquam vel debitis odit reprehenderit
		adipisci dignissimos voluptate? Dolores, officia soluta molestiae natus, reprehenderit
		praesentium ipsa dignissimos non quia iure ullam quae. Qui maiores est quos, distinctio
		provident optio, necessitatibus accusantium accusamus voluptatem quae nam voluptatibus
		eveniet magni non facere suscipit molestias sed ipsum delectus. Laborum maxime magni est
		odit, laboriosam corrupti? Autem, quam ea impedit modi sequi vitae blanditiis eveniet illo
		molestias incidunt, odio placeat? Necessitatibus nesciunt voluptate excepturi id ratione hic
		quibusdam. Tempora saepe impedit autem molestias asperiores dolor obcaecati? Quis eligendi
		omnis ullam, est reiciendis unde dolorum facere et corporis exercitationem blanditiis, sint
		accusamus saepe, iure eveniet maiores vel quia minima reprehenderit incidunt placeat cum
		soluta libero! Ipsa, obcaecati. Pariatur sapiente repudiandae incidunt, maxime, blanditiis,
		dignissimos suscipit autem expedita eius ex enim. Pariatur quisquam hic dolorum illo
		reprehenderit, facere eos, ullam nam id repudiandae assumenda cupiditate rerum possimus
		porro? Fugiat magni sunt molestias rerum quasi atque reprehenderit consectetur eligendi
		perspiciatis enim saepe quam suscipit tempora soluta odio facere accusantium ut tempore,
		quisquam, animi quibusdam quaerat porro voluptatum. Quisquam, aliquid. Facilis fugiat itaque
		unde vero, quos esse ullam amet, ab facere possimus est. Recusandae suscipit vero
		consequatur cum, quisquam, sit ipsam aut vel praesentium quae, corporis eius laudantium
		animi labore! Veniam, ipsam. Numquam quaerat magnam, quas repellendus quo, possimus
		distinctio ex omnis quidem, provident totam laudantium obcaecati autem itaque. Natus sunt
		cum iste quibusdam dolorem totam sed rerum dolores beatae. Fugit debitis quae asperiores
		illo quaerat mollitia nobis eum ea sit aliquam, velit vero repellendus neque libero
		temporibus ipsam facilis repudiandae, laudantium dolores at beatae quidem deserunt
		dignissimos voluptas! Nisi. Nesciunt nostrum debitis aliquam, doloremque vitae ex assumenda
		asperiores nemo dolor laboriosam esse ea iure impedit ipsum, possimus quae optio quasi illo
		ad. Quae accusamus distinctio ab. Voluptates, sunt recusandae? Eligendi ullam fugiat
		exercitationem autem nobis reprehenderit similique eaque cupiditate quo, necessitatibus,
		consequuntur vel tempore error. Voluptatem, odio cumque doloribus explicabo accusamus velit,
		id quis aliquid dolores aspernatur animi minima? Minima tenetur fuga asperiores. Veritatis
		nesciunt sed optio blanditiis in, est labore tempora voluptatem saepe! Ducimus architecto
		quia dolores ex, nemo, minus beatae, numquam sapiente harum asperiores labore! Distinctio,
		quam? Iusto in nihil blanditiis voluptatibus ipsa, et veritatis eius quas officia!
		Praesentium exercitationem qui pariatur sequi nulla natus molestiae sed sit at quasi?
		Laboriosam quia tempora cupiditate laudantium ducimus sunt? Quaerat quas consequuntur iure
		sit repellat accusamus alias voluptatum ipsa? Id cum veniam quasi? Natus officia omnis
		tenetur ipsum suscipit excepturi quam voluptates maiores quasi sed, quas reiciendis
		quibusdam deleniti? Sunt animi magnam magni repellat eveniet atque numquam, modi, veniam
		consectetur reprehenderit neque dolorem quae perferendis, asperiores quis expedita a
		blanditiis amet aspernatur! Natus laborum officiis numquam odio dolor temporibus. Minima,
		magni voluptates! Quaerat iusto molestias nulla itaque excepturi minima sequi aliquid
		exercitationem saepe velit at blanditiis possimus voluptates delectus aspernatur veniam
		consequatur labore ullam nam quae eligendi, porro molestiae! Ad rem recusandae aspernatur,
		harum quasi deleniti voluptatibus corrupti in? Accusantium dolor rerum, nulla unde
		doloremque optio maxime sapiente corrupti dignissimos. Pariatur repudiandae veniam fugiat
		unde perspiciatis dolore et inventore! Ratione repellat ullam dicta autem cumque quas, nisi
		maxime sapiente voluptatem quibusdam aliquam incidunt sint porro nulla eos earum placeat
		dolores modi praesentium ipsa a velit dignissimos corrupti eligendi. Hic. Possimus cum non
		amet eum sapiente minima assumenda sint error ipsum, est adipisci accusantium aut tenetur
		rem voluptatem vel facilis quos cumque ut quasi quo, inventore culpa maxime odio. Pariatur.
		Eligendi doloribus, ipsum, aspernatur animi rerum fugiat officiis ad, eum in dignissimos
		dicta? Odit quam repellat vitae repudiandae magnam quisquam ad consequatur, nisi placeat
		quas ab, harum minus pariatur eum. Reiciendis praesentium debitis natus dolore aut quam odio
		a vitae rerum illum fugiat voluptas, eum minima? Itaque, consequatur quaerat! Accusamus sint
		aut rerum possimus voluptatem ipsum dolorem cum commodi harum? Animi, placeat sequi quasi
		iusto similique nam ex vel quidem odio rerum consequuntur ipsam iste nulla. Eum harum ipsa
		error labore est sit doloribus voluptate fuga odio. Iste, molestiae accusamus? Saepe
		molestiae explicabo adipisci qui veritatis, iusto quis sit neque, libero fugiat enim
		similique maiores vero facilis sunt quod cum necessitatibus. At quidem doloremque a. Odit
		tempora quidem quibusdam doloribus? Praesentium consectetur quis assumenda a inventore.
		Sapiente consectetur veniam vel asperiores repellendus ipsam qui harum repellat perferendis
		saepe similique provident voluptatem, cumque voluptatibus labore! Mollitia facere placeat
		doloremque vel impedit. Eaque, odio cum. Necessitatibus at perspiciatis, error unde alias ex
		pariatur mollitia dolor ad asperiores consectetur deserunt atque culpa id commodi ipsum, sit
		itaque illum ipsam! Blanditiis facilis ipsa fugit. Veniam, fuga optio dicta inventore sint
		nesciunt iste maxime et similique molestias in minima asperiores excepturi voluptatem
		eligendi corrupti a quaerat officiis, quasi ullam deserunt ipsa. Placeat iusto ea
		dignissimos. Deleniti amet commodi itaque iste soluta dolores hic nostrum error sint eum
		odio obcaecati quos cupiditate quibusdam, distinctio facere perferendis. Asperiores
		assumenda similique itaque harum error saepe eveniet, quae veritatis? Cupiditate rem,
		aperiam beatae voluptas, consectetur, vitae magnam vel obcaecati esse atque nam dolore sequi
		tempore impedit nulla quas. Alias molestias eveniet ducimus totam quasi, pariatur fuga a ex
		enim. Nemo dolorum molestiae sunt hic id sequi delectus soluta voluptatum recusandae quasi
		vero, aperiam illo nostrum velit sapiente ipsa quis nihil deserunt adipisci doloribus? Ad
		velit debitis cupiditate. Consectetur, molestiae? Illum quam corporis quos, rem, esse
		tempore vero quasi dolores fugit exercitationem minus odit quas natus. Distinctio optio
		dolorum ad laudantium quidem doloribus enim hic, quasi animi labore neque fuga! Nihil
		voluptatibus ipsum rem voluptates modi, ex autem. Nam sapiente corporis explicabo
		dignissimos ea temporibus consequatur molestiae. Necessitatibus corporis expedita error,
		ducimus tenetur eius dolor possimus. Recusandae, id assumenda. Illo. Voluptatem odit
		assumenda rerum, blanditiis esse sint nemo commodi minus aliquam quod laborum dolore
		distinctio quasi quam. Adipisci commodi, a magnam enim quisquam nisi similique quia, omnis
		impedit, magni dolores? Officiis, eum sint ipsam id quod soluta aliquid quaerat vel deserunt
		nulla? Vitae tempora, natus quidem hic architecto at quaerat tempore consectetur itaque
		obcaecati exercitationem, iure reprehenderit eum aliquid mollitia. Similique tenetur
		repellat quis totam aliquam facilis iste nihil cum quidem qui, deserunt quibusdam
		reprehenderit dolore iusto laudantium magni incidunt tempore officiis provident saepe
		exercitationem nisi distinctio ipsum? Esse, aliquid! Magnam voluptatem nobis facilis
		nesciunt, voluptates placeat explicabo at ipsa minus, neque officia sint labore iusto
		quaerat earum rem omnis corrupti dolorum! Quaerat possimus ut nemo rem libero modi
		distinctio? Necessitatibus expedita impedit, qui eius repudiandae dolore maiores nisi
		consequuntur pariatur doloribus dolorum praesentium officiis aut voluptate maxime, suscipit
		molestiae reprehenderit ipsam obcaecati rerum quia. Delectus vel praesentium dicta
		explicabo. Labore non ducimus debitis voluptas porro ipsa sint harum voluptate eveniet
		perferendis. Nobis cum ab sit omnis quo odit corrupti hic voluptas architecto porro. Iste
		tempora optio excepturi dignissimos inventore? Quia adipisci voluptatum saepe dolores quos
		minima, cupiditate illum dolore id magni magnam, qui nesciunt, aliquid tempore consequatur
		perspiciatis corrupti quidem nobis ex laborum eaque soluta sed. Aliquid, quia dignissimos?
		Repudiandae nisi earum sint ab, vitae itaque quaerat illum praesentium. Facere harum beatae
		voluptates corrupti consectetur, voluptatibus aut aliquid repellendus voluptatum quidem
		totam cupiditate expedita? Repellat suscipit explicabo reiciendis molestias! Facilis harum
		soluta sint, accusamus eum, incidunt veniam recusandae provident ab consequuntur quisquam
		maiores deserunt, dignissimos nisi ratione natus maxime dolorum facere. Praesentium nemo
		nostrum explicabo ducimus maxime in id! Ex perspiciatis vitae officiis! Tempora atque vitae
		blanditiis earum iste. Ab rem iusto, reprehenderit modi odit quo doloremque beatae
		voluptates voluptatibus deserunt accusantium commodi mollitia, expedita eos? Recusandae,
		similique ipsum! Aperiam corporis cupiditate dolorum ut? Non doloribus ex cupiditate officia
		architecto. Harum unde totam nisi possimus aspernatur doloremque cum culpa itaque est, eaque
		ducimus hic explicabo quidem fugit eos doloribus!
	</p>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.canvas_list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	main {
		padding: 5px 30px;
		width: 100%;

		display: flex;
		flex-direction: column;
		row-gap: 30px;

		justify-self: center;

		@media screen and (min-width: $mobile-width) {
			height: fit-content;
			margin: auto 0px;
			padding-bottom: calc(5px + $urlbar-height);
		}

		#intro {
			display: flex;
			flex-direction: column;
			row-gap: 20px;

			#title-container {
				display: flex;
				align-items: center;
				column-gap: 25px;

				#title {
					flex-grow: 1;
					span {
						font-weight: 400;
					}
				}

				#pfp {
					width: 64px;
					height: 64px;
					border-radius: 100%;
				}
			}
		}

		#tabs-cta {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 10px;

			button {
				width: 100%;
			}
		}

		#edit-content {
			#profile_form {
				display: flex;
				flex-direction: column;
				row-gap: 15px;

				label {
					display: flex;
					flex-direction: column;
				}
			}
		}
	}
</style>
