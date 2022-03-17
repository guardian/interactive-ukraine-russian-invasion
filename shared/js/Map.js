import * as d3 from 'd3'
import * as topojson from 'topojson'


export default class Map {

	constructor(width, height, feature, address, scale) {

		this.width = width;
		this.height = height;
		this.projection =  d3.geoMercator().translate([0,0]).scale(1);
		this.path = d3.geoPath().projection(this.projection);
		this.feature = feature;
		this.address = address;
		this.scale = scale;
		this.image;
		this.b;
		this.s;
		this.t;
		this.raster_width;
		this.raster_height;
		this.rtranslate_x;
		this.rtranslate_y;
	}

	makeBackground(node, image, className, overlays = null, extent) {

		//based on https://datawanderings.com/2020/08/08/raster-backgrounds/   

		this.b = this.path.bounds(topojson.feature(this.feature, this.address));

		// scale
		this.s = this.scale / Math.min((this.b[1][0] - this.b[0][0]) / this.width, (this.b[1][1] - this.b[0][1]) / this.height);  
		//const s = projection.scale()

		// transform
		this.t = [(this.width - this.s * (this.b[1][0] + this.b[0][0])) / 2, (this.height - this.s * (this.b[1][1] + this.b[0][1])) / 2];

		// update projection

		if(!extent)
		{
			this.projection
			.scale(this.s)
			.translate(this.t)
		}
		else
		{
			this.projection
			.fitExtent([[0, 0], [this.width, this.height]], extent);
		}


		// scale and postion
		this.raster_width = (this.b[1][0] - this.b[0][0]) * this.s;
		this.raster_height = (this.b[1][1] - this.b[0][1]) * this.s;

		this.rtranslate_x = (this.width - this.raster_width) / 2;
		this.rtranslate_y = (this.height - this.raster_height) / 2;

		this.image = node.append("image")
		.attr('class', className)
		.attr("xlink:href", image)
		.attr("width", this.raster_width)
		.attr("height", this.raster_height)
		.attr("transform", "translate(" + this.rtranslate_x + ", " + this.rtranslate_y + ")")

		overlays.selectAll("image")
		.attr("width", this.raster_width)
		.attr("height", this.raster_height)
		.attr("transform", "translate(" + this.rtranslate_x + ", " + this.rtranslate_y + ")")

	}


	scaleImage(scale, duration = 700, fade = false, pos = {x:0,y:0}, callback = null){

		const s = scale / Math.min((this.b[1][0] - this.b[0][0]) / this.width, (this.b[1][1] - this.b[0][1]) / this.height);  

		const t = [(this.width - s * (this.b[1][0] + this.b[0][0])) / 2, (this.height - s * (this.b[1][1] + this.b[0][1])) / 2];

		this.projection
		.scale(s)
		.translate(t)

		this.raster_width = (this.b[1][0] - this.b[0][0]) * s;
		this.raster_height = (this.b[1][1] - this.b[0][1]) * s;

		this.rtranslate_x = ((this.width - this.raster_width) / 2) + pos.x;
		this.rtranslate_y = ((this.height - this.raster_height) / 2) + pos.y;

		this.image
		.transition()
		.duration(duration)
		.attr("width", this.raster_width)
		.attr("height", this.raster_height)
		.attr("transform", "translate(" + this.rtranslate_x + ", " + this.rtranslate_y + ")")
		.style('opacity', fade == true ? 0 : 1)
		.on('end', callback)

		this.scale = scale;

	}

	zoomToLocation(scale, duration = 700, fade = false, location, callback = null){

		const s = scale / Math.min((this.b[1][0] - this.b[0][0]) / this.width, (this.b[1][1] - this.b[0][1]) / this.height);  

		const t = [(this.width - s * (this.b[1][0] + this.b[0][0])) / 2, (this.height - s * (this.b[1][1] + this.b[0][1])) / 2];

		this.projection
		.scale(s)
		.translate(t)

		this.raster_width = (this.b[1][0] - this.b[0][0]) * s;
		this.raster_height = (this.b[1][1] - this.b[0][1]) * s;

		let projectedCoordinates = this.projection(location)

		this.rtranslate_x = ((this.width - this.raster_width) / 2) + ((this.width / 2) - projectedCoordinates[0]);
		this.rtranslate_y = ((this.height - this.raster_height) / 2) + ((this.height / 2) - projectedCoordinates[1]);

		this.image
			.transition()
			.duration(duration)
			.ease(d3.easeCubic)
			.attr("width", this.raster_width)
			.attr("height", this.raster_height)
			.attr("transform", "translate(" + this.rtranslate_x + ", " + this.rtranslate_y + ")")
			.style('opacity', fade == true ? 0 : 1)
			.on('end', callback)

		this.scale = scale;
	}

	makeLabels(node, object = [{name:'Mariupol', coordinates:[37.549444,47.095833], type:'city', offset:[10,7], align:'end'}], translate = [0,0]){

		object.forEach(o => {

			let posX = this.projection(o.coordinates)[0]
			let posY = this.projection(o.coordinates)[1]

			let textW = node.append('text')
			.attr('transform', `translate(${posX + translate[0]},${posY + translate[1]})`)
			.attr('class', o.type + ' stroke-text' )
			.attr('text-anchor', o.align)
			.text(o.name)
			.call(this.wrapLabel, o.align == 'start' ? o.offset[0] + 'px' : -o.offset[0] + 'px', o.offset[1])

			let text = node.append('text')
			.attr('transform', `translate(${posX + translate[0]},${posY + translate[1]})`)
			.attr('class', o.type)
			.attr('text-anchor', o.align)
			.text(o.name)
			.call(this.wrapLabel, o.align == 'start' ? o.offset[0] + 'px' : -o.offset[0] + 'px', o.offset[1])
			//.call(this.wrapLabel, 50, o.align)

			if(o.type === 'capital'){

				node.append('rect')
				.attr('transform', `translate(${posX + translate[0]},${posY + translate[1]})`)
				.attr('width', '7px')
				.attr('height', '7px')
				.attr('class', 'capital-dot')
			}
			else if(o.type === 'city'){

				node.append('circle')
				.attr('r', '2px')
				.attr('cx', posX + translate[0] + 'px')
				.attr('cy', posY + translate[1] + 'px')
				.attr('class', 'city-dot')
			}
			else if(o.type === 'location'){

				let line = ''

				if(o.align == 'start')line = `M${posX},${posY} ${posX + o.offset[0]-2},${posY}`
				else if(o.align == 'end')line = `M${posX},${posY} ${posX - o.offset[0]+2},${posY}`
				else if(o.align == 'middle')line = `M${posX},${posY} ${posX},${posY + o.offset[1] - 12}`

				node.append('path')
				.attr('d', line)
				.attr('class', 'location-stroke')

				node.append('circle')
				.attr('r', '2px')
				.attr('cx', posX + translate[0] + 'px')
				.attr('cy', posY + translate[1] + 'px')
				.attr('class', 'location-dot')
				.attr('fill', '#000')
			}

		})

	}

	makePoints(node, points, radius, translate = [0,0], move = null, over = null, out = null){

		let circles = node.selectAll('circle')
		.data(points)
		.enter()
		.append('circle')
		.attr('r', radius)
		.attr('class', p => p.location +' '+ p.type)
		.attr('cx', p => this.projection([p.long, p.lat])[0] + translate[0] + 'px')
		.attr('cy', p => this.projection([p.long, p.lat])[1] + translate[1] + 'px')
		.on('mousemove', e => {if(move)move(e)})
		.on('mouseover', (e,d) => {if(over)over(e,d)})
		.on('mouseout', e => {if(out)out(e)})
	}

	makeAnnotation(annotation, text, position, translate = [0,0], lineLength = 15, wrapOptions = {width:150, align:'left'}){

		annotation
		.style('left', translate[0] + 'px')
		.style('top', translate[1] + 'px')

		let group = annotation.select("svg").append('g')
		group.attr('transform', `translate(${this.projection(position)[0]},${this.projection(position)[1]})`)

		let textElement = group.append('text')
		.text(text)
		.call(this.wrap, wrapOptions.width, wrapOptions.align)

		let boundingRect = textElement.node().getBoundingClientRect();
		let stroke = group.append('path');

		switch(wrapOptions.align)
		{
			case 'top':
			textElement.style('transform', `translate(${-boundingRect.width/2}px,${-boundingRect.height}px)`)
			stroke.attr('d', `M0,0 0,-${lineLength}`)
			break;
			case 'right':
			textElement.style('transform', `translate(${lineLength + 3}px,0px)`)
			stroke.attr('d', `M0,0 ${lineLength},0`)
			break;
			case 'bottom':
			textElement.style('transform', `translate(${-boundingRect.width/2}px,${lineLength + 12}px)`)
			stroke.attr('d', `M0,0 0,${lineLength}`)
			break;
			case 'left':
			textElement.style('transform', `translate(-${boundingRect.width + lineLength}px,0px)`)
			stroke.attr('d', `M0,0 -${lineLength},0`)
			break;
		}
	}

	makeArrows(node, feature, arrowHead, translate=[0,0], className=null){

		node.selectAll('path')
		.data(feature)
		.enter()
		.append('path')
		.attr('d', this.path)
		.attr('transform', `translate(${translate[0]}, ${translate[1]})`)
		.attr('class', className)
		.attr("marker-end",arrowHead); 
	}

	makeArea(node, feature,translate=[0,0], className=null){

		node.append('path')
		.datum(feature)
		.attr('d', this.path)
		.attr('transform', `translate(${translate[0]}, ${translate[1]})`)
		.attr('class', 'area-control')
		
	}

	getPoints(longLat){

		return this.projection(longLat)
	}

	getPath(){
		return this.path
	}

	getTransform(){

		let obj = {w:this.raster_width,h:this.raster_height,x:this.rtranslate_x,y:this.rtranslate_y}
		return obj
		
	}

	wrapLabel(text, x, y){

		text.each( function(){

			let txt = d3.select(this);

			let words = txt.text().split(/\s+/);

			let lineNumber = 0;
		        let lineHeight = 1; // ems

		        txt.text(null);

		        words.forEach(word => {

		        	txt.append("tspan")
		        	.attr("x", x)
		        	.attr("y", y)
		        	.attr("dy", lineNumber * lineHeight + "em")
		        	.text(word);

		        	lineNumber++
		        })

		    });


	}

	wrap(text, width){

		let words = text.text().split(" ").reverse();

		let word;
		let line = [];
		let lineNumber = 0;
	    let lineHeight = 1.3; // ems
	    let x = 0
	    let y = 0
	    let dy = 0;
	    let h = 0;

	    let tspan = text.text(null)
	    .append("tspan")
	    .attr("x", x)
	    .attr("y", y)
	    .attr("dy", dy + "em");

	    while (word = words.pop()) {

	    	line.push(word);

	    	tspan.text(line.join(" "));

	    	if (tspan.node().getComputedTextLength() > width) {

	    		h += lineHeight;

	    		line.pop();
	    		tspan.text(line.join(" "));
	    		line = [word];
	    		tspan = text.append("tspan")
	    		.attr("x", x)
	    		.attr("y", y)
	    		.attr("dy", ++lineNumber * lineHeight + "em")
	    		.text(word);
	    	}
	    }
	}
}









