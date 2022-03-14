import request from "request-promise"
import fs from "fs"

export async function render() {


	let files = fs.readdirSync('assets/overlays/');

	const rawData = await request({ "uri": 'https://interactive.guim.co.uk/docsdata/1rCT-QZlo0DNgXXakzyaV8QnB0uQNjoWAfVujgNeA1NY.json', json: true });

	const annotations = new Array({name:'annotations', data:rawData.sheets.Scrolly_annotations});

	const points = new Array({name:'points', data:rawData.sheets.Scrolly_points});

	const data = annotations.concat(points)

	fs.writeFileSync(`assets/json/data.json`, JSON.stringify(data));

	let html = '';

	for(let d of data[0].data)
	{
		html += `<div class="scroll-text__inner">
			<div class="scroll-text__div">
				<time>${d.date}</time>
				<h2>${d['headline-text']}</h2>
				<p>${d['copy-text']}</p>
	    	</div>
	     </div>`

	}

	//let overlayGroups = [...new Set(data[0].data.map(d => d.scope))];
	let overlayImages = [...new Set(data[0].data.map(d => d['image-overlay']))];
	//let htmlGroups = '';

	console.log(overlayImages)

	let images = '';

	for (let i = 0 ; i < overlayImages.length; i++) {

		images += `<image class="map-overlay img-${overlayImages[i].split(".png")[0]}" xlink:href="<%= path %>/overlays/${overlayImages[i]}"></image>`	
	}

	/*for(let group of overlayGroups)
	{
		
		
		let filter = data[0].data.filter(f => f.scope === group);

		for(let i = 0; i < filter.length; i++)
		{
			console.log(filter[i]['image-overlay'])
			if(filter[i]['image-overlay'])images += `<image class="map-overlay img-${filter[i]['image-overlay'].split(".png")[0]}" xlink:href="<%= path %>/overlays/${filter[i]['image-overlay']}"></image>`	
		}

		//htmlGroups += `<g class='${group}'>${images}</g>`
		htmlGroups += images
	}*/


	return `<div id="scrolly-1">
	    <div class="scroll-wrapper">
	        <div class="scroll-inner">
	            <div class="gv-wrapper">
	            	<div class='colour-key-wraper'>
		            	<div class='colour-key-element'>
		            		<div class='key-shaded-area'></div>
		            		<p>Under Russian control</p>
		            	</div>
		            	<div class='colour-key-element'>
		            		<div class='key-arrow'></div>
		            		<p>Russian invasion route</p>
		            	</div>
						<div class='colour-key-element'>
							<div class='key-dot border'></div>
							<p>Russian border crossing</p>
						</div>
						<div class='colour-key-element'>
							<div class='key-dot airstrike'></div>
							<p>Airstrike, shelling or bombing</p>
						</div>
						<div class='colour-key-element'>
							<div class='key-dot russian-attack'></div>
							<p>Russian attack</p>
						</div>
						<div class='colour-key-element'>
							<div class='key-dot russian-ground'></div>
							<p>Russian ground movement</p>
						</div>
						<div class='colour-key-element'>
							<div class='key-dot russian-capture'></div>
							<p>Russian capture</p>
						</div>
						<div class='colour-key-element'>
							<div class='key-dot ukranian-ground'></div>
							<p>Ukrainian ground movement or attack</p>
						</div>
	            	</div>
	            	<div class='annotation-wrapper'>
	            		<div class='annotation'>
							<svg>
								<path d=""/>
								<text></text>
							</svg>
						</div>
					</div>
	            	<svg class="svg-wrapper">
		            	<defs>
						    <marker
						      id="arrow-head-russia"
						      markerUnits="strokeWidth"
						      markerWidth="4"
						      markerHeight="4"
						      viewBox="0 0 10 10"
						      refX="2"
						      refY="5.7"
						      orient="auto">
						      <path d="M2,2l6,4l-6,4V2z"/>
						    </marker>
						    <marker
						      id="arrow-head-ukraine"
						      markerUnits="strokeWidth"
						      markerWidth="4"
						      markerHeight="4"
						      viewBox="0 0 10 10"
						      refX="2"
						      refY="5.7"
						      orient="auto">
						      <path d="M2,2l6,4l-6,4V2z"/>
						    </marker>
					    </defs>
	            		<g class='backgrounds'></g>
	            		<g class='overlays'>${images}</g>
	            	</svg>
	            	<div class='tooltip-map-list'>
						<div class="tooltip-date"></div>
						<div class="tooltip-location"></div>
						<div class="tooltip-caption"></div>
					</div>
	            </div>
	        </div>
	        <div class="scroll-text">
	        ${html}
	        </div>
	    </div>
	</div>`

} 