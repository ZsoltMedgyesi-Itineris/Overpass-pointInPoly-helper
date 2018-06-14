var fs = require('fs')
var async = require('async')
var inside = require('point-in-polygon')

var polygons = {}
var ways = {}
var nodes = {}

var parsePolygons = (callback) => {
	var polyFile = "./resources/industrials.json"
	fs.readFile(polyFile, (err, result) => {
		if (err) {
			callback(err)
		}
		else {
			var data = JSON.parse(result).elements
			data.forEach((entry) => {
				if (entry.type == "node") {
					nodes[entry.id] = [entry.lat,entry.lon]
				}
				else if (entry.type == "way") {
					polygons[entry.id] = {
						nodes: entry.nodes
					}
				}
			})
			for (var i in polygons) {
				let poly = polygons[i]
				poly.points = []
				poly.nodes.forEach((node) => {
					if (nodes[node]) {
						poly.points.push(nodes[node])
					}
				})
			}
			callback()
		}
	})
}
var parseWays = (callback) => {
	var wayFile = "./resources/noaccess.json"
	fs.readFile(wayFile, (err, result) => {
		if (err) {
			callback(err)
		}
		else {
			var data = JSON.parse(result).elements
			data.forEach((entry) => {
				if (entry.type == "node") {
					nodes[entry.id] = [entry.lat, entry.lon]
				}
				else if (entry.type == "way") {
					//if (!entry.tags.psv && !entry.tags.foot) {
						ways[entry.id] = {
							nodes: entry.nodes
						}
					//}
				}
			})
			for (var i in ways) {
				let way = ways[i]
				way.points = []
				way.nodes.forEach((node) => {
					if (nodes[node]) {
						way.points.push(nodes[node])
					}
				})
			}
			callback()
		}
	})
}

var findIntersections = (callback) => {
	var cnt = 0;
	for (var i in ways) {
		let way = ways[i]
		for (var j in way.points) {
			let found = false
			let point = way.points[j]
			for (var k in polygons) {
				let poly = polygons[k]
				if (inside(point, poly.points)) {
					console.log("Intersection: wayid: " + i + " polyid: " + k +" https://www.openstreetmap.org/edit?way="+i)
					cnt++;
					found = true;
					break;
				}
			}
			if (found) {
				break;
			}
		}
	}
	console.log(cnt)
	async.setImmediate(callback)
}

async.series(
	[
		parsePolygons,
		parseWays,
		findIntersections
	],
	(err) => {
		if (err) {
			console.log(err)
		}
		else {
			console.log("finished")
		}
	}
)
