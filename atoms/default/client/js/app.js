import * as d3 from 'd3'
import * as topojson from 'topojson'
import Map from 'shared/js/Map'
import geo from 'assets/json/extents.json'
import prewar from 'assets/pre-invasion-deployments.json'
import troopNumbers from 'assets/troop-numbers.json'
import arrowsGeo from 'assets/arrows.json'
import overlaysGeo from 'assets/json/merged.json'
import ScrollyTeller from "shared/js/scrollyteller"
import data from "assets/json/data.json"


//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//------------------------- AREAS OF CONTROL ---------------------------------
//https://drive.google.com/drive/u/0/folders/1qTbR4tX2K_bFk07s7BBMkfBz6Pho5xgt
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//--------------------------------ARROWS--------------------------------------
//https://rochan-consulting.com/
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------


const cities = [
{name:'Moscow', coordinates:[37.6216393,55.753705], type:'capital', offset:[10,7], align:'start'},
{name:'Kyiv', coordinates:[30.523399,50.450100], type:'capital', offset:[10,7], align:'start'},
{name:'Kharkiv', coordinates:[36.25904386,49.99533397], type:'city', offset:[10,7], align:'end'},
{name:'Lviv', coordinates:[24.0066233,49.836511], type:'city', offset:[10,7], align:'start'},
{name:'Mariupol', coordinates:[37.549444,47.095833], type:'city', offset:[10,7], align:'end'}
]

const locations = [
{name:'Hostomel airbase', coordinates:[30.2051942,50.5910657], type:'location', offset:[10,4], align:'end'},
{name:'Presidential Palace', coordinates:[30.5354207,50.4483553], type:'location', offset:[10,4], align:'start'},
{name:'Boryspil International airport', coordinates:[30.8806328,50.3426539], type:'location', offset:[15,4], align:'start'}
]

const areas = [
{name:'Crimea', coordinates:[34.4975073,45.345141], type:'area', offset:[0,0], align:'middle'},
{name:'Donbass', coordinates:[38.9081713,48.11942], type:'area', offset:[0,0], align:'middle'}
]

const countries = [
{name:'Ukraine', coordinates:[31.3845243,49.0016335], type:'country', offset:[0,0], align:'center'},
{name:'Belarus', coordinates:[27.4128463,53.2255732], type:'country', offset:[0,0], align:'center'},
{name:'Russia', coordinates:[38.1334343,53.4931992], type:'country', offset:[0,0], align:'center'}
]

const geographies = [
{name: 'Dnieper river', coordinates:[32.8743653,49.249875], type:'text-water'}
]

const isMobile = window.matchMedia('(max-width: 800px)').matches;

console.log('isMobile', isMobile)

const atomEl = d3.select('#scrolly-1').node();

const width = atomEl.getBoundingClientRect().width;
const height = isMobile ? 667.92 * width / 597.12 : 426 * width / 714.96;
const ratio = width * 100 / 1260;

let ukraineBgImage = isMobile ? 'ukraine-v' : 'ukraine-h';
let southUkraineBgImage = isMobile ? 'south-ukraine-v' : 'south-ukraine-h';
let kievBgImage = isMobile ? 'kiev-v' : 'kiev-h';

let ukraineObj = isMobile ? geo.objects['ukraine-v'] : geo.objects['ukraine-h'];

let southUkraineObj =  isMobile ?  geo.objects['south-ukraine-v'] : geo.objects['south-ukraine-h'];

let kievObj = isMobile ? geo.objects['kiev-v'] : geo.objects['kiev-h'];


const tooltip = d3.select('.tooltip-map-list')
const annotation = d3.select('.annotation')

const svg = d3.select('.svg-wrapper')
/*.attr('width', width)
.attr('height', height)*/
.attr("viewBox", `0 0 ${width} ${height}`)

const overlays = svg.select('.overlays');
const arrows = overlays.append('g')
const labels = overlays.append('g')
const dots = overlays.append('g')
const bubbles = overlays.append('g')

const backgrounds = svg.select('.backgrounds')

const kiev = new Map(width, height, geo, kievObj, 1)
const kievBg = kiev.makeBackground(backgrounds, `<%= path %>/jpg/${kievBgImage}.jpg`, 'kiev-bg', overlays)
svg.select('.kiev-bg').attr('display', 'none')

const southUkraine = new Map(width, height, geo, southUkraineObj, 1)
const southUkrainekieBg = southUkraine.makeBackground(backgrounds, `<%= path %>/jpg/${southUkraineBgImage}.jpg`, 'south-ukraine-bg', overlays)
svg.select('.south-ukraine-bg').attr('display', 'none')

const ukraine = new Map(width, height, geo, ukraineObj, 1)
const ukraineBg = ukraine.makeBackground(backgrounds, `<%= path %>/jpg/${ukraineBgImage}.jpg`, 'ukraine-bg', overlays)

ukraine.makeLabels(labels, cities)
ukraine.makeLabels(labels, areas)


const scrolly = new ScrollyTeller({
	parent: document.querySelector("#scrolly-1"),
    triggerTop: .5, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: false
});

const triggerPoints = data[0].data;
const mapPoints = data[1].data;

triggerPoints.forEach((d,i) => {

	scrolly.addTrigger({num: i+1, do: () => {

		annotation.style('display', 'none')
		tooltip.classed('over', false)
		arrows.selectAll('path').remove()
		dots.selectAll('circle').remove()
		bubbles.selectAll('circle').remove()
		labels.selectAll('*').remove()
		//overlays.selectAll('image').classed('render', false)

		let points = mapPoints.filter(f => f['scrolly-stage'] === String(i+1));
		let caption = points.find(f => f['caption-on-viz'] === 'Y');
		//let overlay = overlays.select('.img-' + d['image-overlay'].split('.png')[0]);

		if(d.scope === 'wider-Ukraine'){
			console.log('wider ukraine')
			let scale = isMobile ? 1 : 1;
			let x = isMobile ? 0 : 0;
			let y = isMobile ? 0 : 0;

			ukraine.scaleImage(scale, 300,  false,{x:x, y:y}, () => {

				ukraine.makeLabels(labels, countries, [x,y])
				ukraine.makeLabels(labels, cities, [x,y])
				ukraine.makeLabels(labels, areas, [x,y])

				/*if(overlay.node())
				{
					overlay.classed('render', true);

					overlay
					.attr("width", ukraine.getTransform().w)
					.attr("height", ukraine.getTransform().h)
					.attr('transform',`translate(${ukraine.getTransform().x}, ${ukraine.getTransform().y})`)
				}*/

				dots.selectAll('circle')
					.data(prewar)
					.join('circle')
					.attr('class', 'buildup')
					.attr('r', 5)
					.attr('cx', d =>ukraine.getPoints([d.Longitude, d.Latitude])[0])
					.attr('cy', d =>ukraine.getPoints([d.Longitude, d.Latitude])[1])

				bubbles.selectAll('circle')
					.data(troopNumbers)
					.join('circle')
					.attr('class', 'bubble')
					.attr('r', d => {
						let scaleFactor = isMobile ? 0.5 : 1;
						return Math.sqrt(d.Value / Math.PI) * scaleFactor
					})
					.attr('cx', d => ukraine.getPoints([d.Longitude, d.Latitude])[0])
					.attr('cy', d => ukraine.getPoints([d.Longitude, d.Latitude])[1])
				
			})
		}
		else if(d.scope === 'Ukraine')
		{

			console.log('ukraine')
			backgrounds.select('.ukraine-bg').attr('display','block')
			backgrounds.select('.kiev-bg').attr('display','none')

			let scale = isMobile ? 1.5 : 1.3;
			let x = isMobile ? 0 : 150;
			let y = isMobile ? -100 : -100;

			ukraine.scaleImage(scale, 300, false, {x:x, y:y}, () => {

				ukraine.makeLabels(labels, cities, [x,y])
				ukraine.makeLabels(labels, areas, [x,y])

				console.log(d['image-overlay'])


				/*overlays.selectAll('path')
				.data(topojson.feature(overlaysGeo, overlaysGeo.objects.merged.geometries.find(f => f.properties.layer === 'overlay-2502')).features)
				.enter()
				.append('path')
				.attr('d', ukraine.getPath())*/

				//ukraine.makeArea(overlays, topojson.feature(overlaysGeo, overlaysGeo.objects.merged.geometries.find(f => f.properties.layer === 'overlay-2502')), [x,y])

				/*overlays.append('path')
				.datum(topojson.feature(overlaysGeo, overlaysGeo.objects.merged.geometries.find(f => f.properties.layer === 'overlay-2802')))
				.attr('d', ukraine.getPath())
				.attr('transform',`translate(${ukraine.getTransform().x}px, ${ukraine.getTransform().y}px)`)*/

/*
				if(overlay.node())
				{
					overlay.classed('render', true)

					overlay
					.attr("width", ukraine.getTransform().w)
					.attr("height", ukraine.getTransform().h)
					.attr('transform',`translate(${ukraine.getTransform().x}, ${ukraine.getTransform().y})`)
				}*/

				ukraine.makePoints(dots, points, isMobile ? 4 : 5, [x,y], manageMove, manageOver, manageOut)	

				if(d['arrow-overlay'])
				{
					let feature = topojson.feature(arrowsGeo,arrowsGeo.objects.arrows).features.filter(f => f.properties.layer === d['arrow-overlay'] && f.properties.color24 === 45823);

					ukraine.makeArrows(arrows, feature, "url(#arrow-head-russia)", [x,y], 'russian-move')
				}	
			})
		}
		else if(d.scope === 'south-Ukraine'){
			console.log('south ukraine')

			backgrounds.select('.south-ukraine-bg').attr('display','block')

			let scale = 2;
			let southUkraineCenterCoordinates = [33.947754, 45.981934]
			ukraine.zoomToLocation(scale, 600, true, southUkraineCenterCoordinates, () => {
				backgrounds.select('.ukraine-bg').attr('display','none')
				backgrounds.select('.kiev-bg').attr('display','none')
			})

		}
		else if(d.scope === 'Kyiv')
		{
			console.log('kyiv')

			dots.selectAll('circle').remove()

			let scale = 10;
			let x = isMobile ? 0 : 2000;
			let y = isMobile ? 0 : 800;

			let kyiv = cities.filter(c => c.name === 'Kyiv')[0];

			backgrounds.select('.kiev-bg').attr('display','block')
			backgrounds.select('.south-ukraine-bg').attr('display','none')

			ukraine.zoomToLocation(scale, 600, true, kyiv.coordinates, () => {

				backgrounds.select('.ukraine-bg').attr('display','none')

				kiev.makeLabels(labels, locations)

				kiev.makePoints(dots, points, isMobile ? 4 : 5, [0,0], manageMove, manageOver, manageOut)

				/*if(overlay.node())
				{
					overlay.classed('render', true)

					overlay
					.attr("width", kiev.getTransform().w)
					.attr("height", kiev.getTransform().h)
					.attr('transform',`translate(${kiev.getTransform().x}, ${kiev.getTransform().y})`)
				}*/

				if(d['arrow-overlay'])
				{
					let feature = topojson.feature(arrowsGeo,arrowsGeo.objects.arrows).features.filter(f => f.properties.layer === d['arrow-overlay'] && f.properties.color24 === 45823);

					ukraine.makeArrows(arrows, feature, "url(#arrow-head-russia)", [x,y], 'russian-move')
				}	

			})
		}

	}})

})

scrolly.watchScroll();

//---------------------helpers--------------------------------

window.onscroll = (e) => {

	tooltip.classed('over', false)
	
}

const manageMove = (event) => {

	console.log(event)

	tooltip.classed('over', true)

	let left = event.layerX  /*- atomEl.getBoundingClientRect().left*/;
	let top = event.layerY/* - atomEl.getBoundingClientRect().top*/;

	let tWidth = tooltip.node().getBoundingClientRect().width;
	let tHeight = tooltip.node().getBoundingClientRect().height;

	let posX = left - (tWidth / 2);
	let posY = top + 15;

	tooltip.style('left',  posX + 'px')
	tooltip.style('top', posY + 'px')

}

const manageOver = (event, el) => {

	tooltip.select('.tooltip-date').html(el.date)
	tooltip.select('.tooltip-location').html(el.location)
	tooltip.select('.tooltip-caption').html(el.caption)

}

const manageOut = (event) => {
	tooltip.classed('over', false)
}

