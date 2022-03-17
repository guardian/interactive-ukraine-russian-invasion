import * as d3 from 'd3'
import * as topojson from 'topojson'
import Map from 'shared/js/Map'
import geo from 'assets/json/extents-new.json'
import prewar from 'assets/pre-invasion-deployments.json'
import troopNumbers from 'assets/troop-numbers.json'
import arrowsGeo from 'assets/json/arrows-15mar.json'
import overlaysGeo from 'assets/json/areas-16m.json'
import ScrollyTeller from "shared/js/scrollyteller"
import data from "assets/json/data.json"
import water from "assets/json/kiyiv-water.json"


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
{name:'Kyiv', coordinates:[30.523399,50.450100], type:'capital', offset:[0,20], align:'middle'},
{name:'Kharkiv', coordinates:[36.25904386,49.99533397], type:'city', offset:[10,7], align:'end'},
{name:'Lviv', coordinates:[24.0066233,49.836511], type:'city', offset:[5,3], align:'start'},
{name:'Mariupol', coordinates:[37.549444,47.095833], type:'city', offset:[0,15], align:'start'},
{name:'Kherson', coordinates:[32.5943554,46.6555112], type:'city', offset:[5,3], align:'end'}
]

const locations = [
{name:'Hostomel airbase', coordinates:[30.2051942,50.5910657], type:'location', offset:[10,4], align:'start'},
{name:'Presidential Palace', coordinates:[30.5354207,50.4483553], type:'location', offset:[0,30], align:'middle'},
{name:'Boryspil International airport', coordinates:[30.8806328,50.3426539], type:'location', offset:[15,4], align:'end'}
]

const areas = [
{name:'Crimea', coordinates:[34.4975073,45.345141], type:'area', offset:[0,0], align:'middle'},
{name:'Separatist- controlled area', coordinates:[38.9081713,48.11942], type:'area', offset:[20,-25], align:'middle'}
]

const countries = [
{name:'Ukraine', coordinates:[31.3845243,49.0016335], type:'country', offset:[5,10], align:'center'},
{name:'Belarus', coordinates:[27.4128463,53.2255732], type:'country', offset:[0,-20], align:'center'},
{name:'Russia', coordinates:[38.1334343,53.4931992], type:'country', offset:[0,0], align:'center'}
]

const geographies = [
{name: 'Dnieper river', coordinates:[32.8743653,49.249875], type:'text-water'}
]

const isMobile = window.matchMedia('(max-width: 800px)').matches;

const atomEl = d3.select('#scrolly-1').node();

const width = atomEl.getBoundingClientRect().width;
const height = isMobile ? 667.92 * width / 597.12 : 426 * width / 714.96;
const heightKiev = isMobile ? 480 * width / 429.12 : 431.04 * width / 714.96;
const heightSouthUkraine = isMobile ? 480 * width / 429.12 : 395.04 * width / 714.96;
const ratio = width * 100 / 1260;

let ukraineBgImage = isMobile ? 'ukraine-v-new' : 'ukraine-h-new';
let southUkraineBgImage = isMobile ? 'south-ukraine-v-new' : 'south-ukraine-h-new';
let kievBgImage = isMobile ? 'kiev-v' : 'kiev-h';

let ukraineObj = isMobile ? geo.objects['ukraine-v'] : geo.objects['ukraine-h'];

let southUkraineObj =  isMobile ?  geo.objects['south-ukraine-v'] : geo.objects['south-ukraine-h'];

let kievObj = isMobile ? geo.objects['kiev-v'] : geo.objects['kiev-h'];


const tooltip = d3.select('.tooltip-map-list')
const annotation = d3.select('.annotation')
const colorKey = d3.select('.colour-key-wraper')
.style('opacity', 0)

const svg = d3.select('.svg-wrapper')
/*.attr('width', width)
.attr('height', height)*/
.attr("viewBox", `0 0 ${width} ${height}`)

const overlays = svg.select('.overlays');
const areasControl = overlays.append('g')
const arrows = overlays.append('g')

const dots = overlays.append('g')
const bubbles = overlays.append('g')
const labels = overlays.append('g')
const defs = d3.select('defs')

defs.append('mask')
.attr('id', 'map-mask')


const backgrounds = svg.select('.backgrounds')

const kievExtentDessktop = {
				        type: "LineString",

				         coordinates: [
				            [29.7872132485128382, 50.1234704371395523],
				            [31.2065873300330452, 50.1234704371395523],
				            [31.2065873300330452, 50.6699457973042513],
				            [29.7872132485128382, 50.6699457973042513],
				        ]}

const kievExtentMobile = {
				        type: "LineString",

				         coordinates: [
				            [30.0783135071483692, 50.0966350615756042],
				            [30.9299379560604955, 50.0966350615756042],
				            [30.9299379560604955, 50.7040745278488316],
				            [30.0783135071483692, 50.7040745278488316],
				        ]}

const kiev = new Map(width, heightKiev , geo, kievObj, 1)
const kievBg = kiev.makeBackground(backgrounds, `<%= path %>/jpg/${kievBgImage}.jpg`, 'kiev-bg', overlays, isMobile ? kievExtentMobile : kievExtentDessktop)
svg.select('.kiev-bg').attr('display', 'none')

const southUkraine = new Map(width, heightSouthUkraine, geo, southUkraineObj, 1)
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

if(isMobile){

	let dist = height + 30

	d3.select('.scroll-text')
	.style('top', dist + 'px')

	document.querySelector(".scroll-wrapper").style.height = d3.select('.scroll-text').node().getBoundingClientRect().height + 'px'

}

const triggerPoints = data[0].data;
const mapPoints = data[1].data;

let currentScale = 1;

triggerPoints.forEach((d,i) => {

	scrolly.addTrigger({num: i+1, do: () => {

		annotation.style('display', 'none')
		tooltip.classed('over', false)
		arrows.selectAll('path').remove()
		dots.selectAll('circle').remove()
		bubbles.selectAll('circle').remove()
		labels.selectAll('*').remove()
		overlays.selectAll('path').remove()

		overlays
	    .interrupt()
	    .transition();


		let points = mapPoints.filter(f => f['scrolly-stage'] === String(i+1));
		let caption = points.find(f => f['caption-on-viz'] === 'Y');

		if(d.scope === 'wider-Ukraine'){
			console.log('wider ukraine')
			let scale = isMobile ? 1 : 1;
			let x = isMobile ? 0 : 0;
			let y = isMobile ? 0 : 0;

			colorKey.style('opacity', 0)

			ukraine.scaleImage(scale, 300,  false,{x:x, y:y}, () => {

				console.log(labels)

				ukraine.makeLabels(labels, countries, [x,y])
				ukraine.makeLabels(labels, cities.filter(f => f.type === 'capital'), [x,y])
				ukraine.makeLabels(labels, areas, [x,y])

				ukraine.makeArea(areasControl, topojson.merge(overlaysGeo, overlaysGeo.objects.areas.geometries.filter(f => f.properties.layer === d['image-overlay'])), [x,y])

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

					
				annotation.style('display', 'block')
				ukraine.makeAnnotation(annotation, "Russian military deployment", [39.168586356, 51.51019768], [0, 0], 15, {width:100, align:'right'})

				let lineLength = isMobile ? 30 : 60;
				ukraine.makeAnnotation(annotation, "Estimated 5000 troops", [44.5, 48.738889], [0, 0], lineLength, {width:70, align:'bottom'})

				lineLength = isMobile ? 20 : 40;
				ukraine.makeAnnotation(annotation, "Estimated 1200 troops", [29.608333, 46.844444], [0, 0], lineLength, {width:70, align:'left'})

			})

			currentScale = scale
		}
		else if(d.scope === 'Ukraine')
		{

			colorKey.style('opacity', 1)

			console.log('ukraine')
			backgrounds.select('.ukraine-bg').attr('display','block')
			backgrounds.select('.kiev-bg').attr('display','none')

			let scale = isMobile ? 1.5 : 1.3;
			let x = isMobile ? 75 : 180;
			let y = isMobile ? -100 : -120;



			if(currentScale != scale)
			{
				ukraine.scaleImage(scale, 300, false, {x:x, y:y}, () => {

					renderUkraine(x,y,d,points)
				
				})

				currentScale = scale
			}
			else
			{
				renderUkraine(x,y,d,points)
			}

			
		}
		else if(d.scope === 'south-Ukraine'){
			console.log('south ukraine')

			colorKey.style('opacity', 1)

			backgrounds.select('.south-ukraine-bg').attr('display','block')

			let scale = 2;
			let southUkraineCenterCoordinates = [33.947754, 44.981934]

			ukraine.zoomToLocation(scale, 600, true, southUkraineCenterCoordinates, () => {
				backgrounds.select('.ukraine-bg').attr('display','none')
				backgrounds.select('.kiev-bg').attr('display','none')

				southUkraine.makeLabels(labels, cities)
				southUkraine.makeLabels(labels, areas)

				southUkraine.makePoints(dots, points, 5, [0,0], manageMove, manageOver, manageOut)

				southUkraine.makeArea(areasControl, topojson.merge(overlaysGeo, overlaysGeo.objects.areas.geometries.filter(f => f.properties.layer === d['image-overlay'])))

				if(d['arrow-overlay'])
				{
					let feature = topojson.feature(arrowsGeo,arrowsGeo.objects.arrows).features.filter(f => f.properties.layer === d['arrow-overlay'] && f.properties.color24 === 45823);

					southUkraine.makeArrows(arrows, feature, "url(#arrow-head-russia)", [0,0], 'russian-move')
				}
			})

			currentScale = scale

		}
		else if(d.scope === 'Kyiv')
		{
			console.log('kyiv')

			colorKey.style('opacity', 1)

			dots.selectAll('circle').remove()

			let scale = 10;
			let x = isMobile ? 0 : 0;
			let y = isMobile ? 0 : 0;

			let kyiv = cities.filter(c => c.name === 'Kyiv')[0];

			backgrounds.select('.kiev-bg').attr('display','block')
			backgrounds.select('.south-ukraine-bg').attr('display','none')

			ukraine.zoomToLocation(scale, 600, true, kyiv.coordinates, () => {

				backgrounds.select('.ukraine-bg').attr('display','none')

				kiev.makeLabels(labels, locations)

				//kiev.makePoints(dots, points,  5, isMobile ? [20,0] : [30,20], manageMove, manageOver, manageOut)
				kiev.makePoints(dots, points,  5, [0,0], manageMove, manageOver, manageOut)

				kiev.makeArea(areasControl, topojson.merge(overlaysGeo, overlaysGeo.objects.areas.geometries.filter(f => f.properties.layer === d['image-overlay'])), [x,y])

				if(d['arrow-overlay'])
				{
					let feature = topojson.feature(arrowsGeo,arrowsGeo.objects.arrows).features.filter(f => f.properties.layer === d['arrow-overlay'] && f.properties.color24 === 45823);

					kiev.makeArrows(arrows, feature, "url(#arrow-head-russia)", [x,y], 'russian-move')
				}	

			})

			currentScale = scale
		}

	}})

})

scrolly.watchScroll();

//---------------------helpers--------------------------------

window.onscroll = (e) => {

	tooltip.classed('over', false)

	//stop all transitions
	
}

const manageMove = (event) => {

	

}

const manageOver = (event, el) => {

	tooltip.select('time').html(el.date)
	tooltip.select('.tooltip-location').html(el.location)
	tooltip.select('.tooltip-caption').html(el.caption)

	tooltip.classed('over', true)

	let left = event.layerX  /*- atomEl.getBoundingClientRect().left*/;
	let top = event.layerY/* - atomEl.getBoundingClientRect().top*/;

	let tWidth = tooltip.node().getBoundingClientRect().width;
	let tHeight = tooltip.node().getBoundingClientRect().height;

	let posX = left - (tWidth / 2);
	let posY = top + 15;

	if(posX < 0 || isMobile && posX +  tWidth > width) posX = 0;
	if(posY + tHeight > height) isMobile ? posY = 0 : posY = height - tHeight;

	tooltip.style('left',  posX + 'px')
	tooltip.style('top', posY + 'px')

}

const manageOut = (event) => {
	tooltip.classed('over', false)
}

const renderUkraine = (x,y,d,points) => {
	ukraine.makeLabels(labels, cities, [x,y])
	ukraine.makeLabels(labels, areas, [x,y])

	ukraine.makeArea(areasControl, topojson.merge(overlaysGeo, overlaysGeo.objects.areas.geometries.filter(f => f.properties.layer === d['image-overlay'])), [x,y])

	ukraine.makePoints(dots, points, 5, [x,y], manageMove, manageOver, manageOut)	

	if(d['arrow-overlay'])
	{
		let feature = topojson.feature(arrowsGeo,arrowsGeo.objects.arrows).features.filter(f => f.properties.layer === d['arrow-overlay'] && f.properties.color24 === 45823);

		ukraine.makeArrows(arrows, feature, "url(#arrow-head-russia)", [x,y], 'russian-move')
	}	
}

