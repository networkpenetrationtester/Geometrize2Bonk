const fs = require("node:fs");
const pretty = require("pretty");
class Vertice {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        return this.init();
    }
    init() {
        this.point = [this.x, this.y]
        return this.point;
    }
}
class Polygon {
    constructor(data) {
        this.data = data;
        this.vertices = [];
        this.internalObject = {
            type: "po",
            v: this.createVertices(this.data),
            s: 1 / LEVEL_DATA.DOWNSCALE,
            a: 0,
            c: [0, 0]
        }
    }
    createVertices(data) {
        if (data.length == 0) {
            throw new Error("Data was null!")
        }
        if (data.length % 2 > 0) {
            throw new Error("Not a (valid) polygon!")
        }
        for (let i = 0; i < data.length - 1; i += 2) {
            this.vertices.push(new Vertice(data[i], data[i + 1]))
        }
        return this.vertices;
    }
    get mapObject() {
        return JSON.stringify(this.internalObject)
    }
}
class Triangle extends Polygon {
    constructor(data) {
        super(data);
    }
    createVertices(data) {
        if (data.length == 0) {
            throw new Error("Data was null!")
        }
        if (data.length % 2 > 0) {
            throw new Error("Not a (valid) polygon!")
        }
        if (data.length > 6) {
            throw new Error("Not a triangle!")
        }
        for (let i = 0; i < data.length - 1; i += 2) {
            this.vertices.push(new Vertice(data[i], data[i + 1]))
        }
        return this.vertices;
    }
}
class Rectangle {
    constructor(data) {
        this.data = data;
        this.x1 = this.data[0];
        this.x2 = this.data[2];
        this.y1 = this.data[1];
        this.y2 = this.data[3];
        this.center = [(this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2];
        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
        this.internalObject = {
            type: "bx",
            w: this.width,
            h: this.height / LEVEL_DATA.DOWNSCALE,
            c: [this.center[0] / LEVEL_DATA.DOWNSCALE, this.center[1] / LEVEL_DATA.DOWNSCALE],
            a: 0,
            sk: false
        }
    }
    get mapObject() {
        return JSON.stringify(this.internalObject);
    }
}
class Circle {
    constructor(data) {
        this.data = data;
        this.center = [this.data[0], this.data[1]];
        this.radius = this.data[2];
        this.internalObject = {
            type: "ci",
            r: this.radius / LEVEL_DATA.DOWNSCALE,
            c: [this.center[0] / LEVEL_DATA.DOWNSCALE, this.center[1] / LEVEL_DATA.DOWNSCALE],
            sk: false
        }
    }
    get mapObject() {
        return JSON.stringify(this.internalObject);
    }
}
class Fixture {
    constructor(sh) {
        this.sh = sh;
        this.color = LEVEL_DATA.colors[this.sh];
        this.internalObject = {
            sh: this.sh,
            n: "",
            fr: null,
            fp: null,
            re: null,
            de: null,
            f: this.color,
            d: false,
            np: true,
            ng: false
        };
    }
    get mapObject() {
        return JSON.stringify(this.internalObject);
    }
}
class Body {
    constructor(id) {
        this.id = id;
        this.fixtures = LEVEL_DATA.FXBODYPAIRS[this.id];
        this.position = [((-GEO_DATA.DIMEN.x / 2) / LEVEL_DATA.DOWNSCALE) - (LEVEL_DATA.DOWNSCALE / 2), (-GEO_DATA.DIMEN.y / 2) / LEVEL_DATA.DOWNSCALE];
        /* 
        this.internalObject = {
            a: 0,
            ad: 0,
            av: 0,
            bu: false,
            cf: {
                x: 0,
                y: 0,
                w: true,
                ct: 0
            },
            de: 0,
            f_c: 1,
            f_p: true,
            f_1: true,
            f_2: true,
            f_3: true,
            f_4: true,
            fr: false,
            fric: 0,
            fricp: false,
            fx: this.fixtures,
            fz: {
                on: false,
                x: 0,
                y: 0,
                d: true,
                p: true,
                a: true
            },
            ld: 0,
            lv: [0, 0],
            n: "",
            p: this.position,
            re: 0,
            type: "s",
        }
        */
        this.internalObject = {
            a: 0,
            av: 0,
            cf: {
                ct: 0,
                w: true,
                x: 0,
                y: 0
            },
            fx: this.fixtures,
            fz: {
                a: true,
                cf: 0,
                d: true,
                on: false,
                p: true,
                t: 0,
                x: 0,
                y: 0
            },
            lv: [
                0,
                0
            ],
            p: this.position,
            s: {
                ad: 0,
                bu: false,
                de: 0,
                f_1: true,
                f_2: true,
                f_3: true,
                f_4: true,
                f_c: 1,
                f_p: true,
                fr: false,
                fric: 0.5,
                fricp: false,
                ld: 0,
                n: "",
                re: 0,
                type: "d"
            }
        }
    }
    get mapObject() {
        return JSON.stringify(this.internalObject);
    }
}
/* class Bro {
    constructor(data) {
        this.data = data;
    }
} */
const Generators = {
    SHAPES() {
        function ToBonkColor(RGB) {
            RGB.length > 3 && (RGB.length = 3);
            return Number("0x" + RGB.map((i) => { return (i = i.toString(16)).length < 2 ? "0" + i : i }).join(""));
        }
        function ToBonkShape(geoShape) {
            var data = geoShape.data,
                type = geoShape.type,
                bonkShape;
            switch (type) {
                case 1:
                    bonkShape = new Rectangle(data);
                    break;
                case 4:
                    bonkShape = new Triangle(data);
                    break;
                case 32:
                    bonkShape = new Circle(data);
                    break;
            }
            return bonkShape.mapObject;
        }
        GEO_DATA.SHAPES.forEach((shape) => {
            LEVEL_DATA.colors.push(ToBonkColor(shape.color));
            LEVEL_DATA.shapes.push(ToBonkShape(shape));
        });
    },
    FIXTURES() {
        for (i in LEVEL_DATA.shapes)
            LEVEL_DATA.fixtures.push(new Fixture(i).mapObject);
    },
    BODIES() {
        var numBodies = 0,
            remainder = 0,
            createdFixtures = 0,
            createdBodies = 0;
        var numFixtures = LEVEL_DATA.fixtures.length - 1;
        (numFixtures > 0) && (numBodies = 1, remainder = 0);
        (numFixtures > 100) && (remainder = numFixtures % 100, numBodies = (numFixtures - remainder) / 100);
        for (i = 0; i < numBodies; i++, createdBodies++) {
            LEVEL_DATA.FXBODYPAIRS.push([]);
            for (j = 0; j < 100; j++, createdFixtures++)
                LEVEL_DATA.FXBODYPAIRS[i].push(j + createdBodies * 100);
        }
        if (remainder > 0) {
            numBodies++, LEVEL_DATA.FXBODYPAIRS.push([])
            for (i = 0; i < remainder; i++)
                LEVEL_DATA.FXBODYPAIRS[numBodies - 1].push(createdFixtures + i)
        }
        for (i in LEVEL_DATA.FXBODYPAIRS)
            LEVEL_DATA.bodies.push(new Body(i).mapObject);
    },
    BRO() {
        for (i in LEVEL_DATA.bodies)
            LEVEL_DATA.bro.push(i);
        LEVEL_DATA.bro.join();
    }
}

const LEVEL_DATA = {
    author: "Bonk.io player",
    DOWNSCALE: 1,
    FXBODYPAIRS: [],
    colors: [],
    shapes: [],
    fixtures: [],
    bodies: [],
    bro: [],
    name: "",
    get map() {
        return `{
            "capZones": [],
            "m": {
                "a": "${LEVEL_DATA.author}",
                "authid": -1,
                "cr": ["${LEVEL_DATA.author}"],
                "date": "",
                "dbid": -1,
                "dbv": 2,
                "mo": "",
                "n": "${LEVEL_DATA.name}",
                "pub": false,
                "rxa": "",
                "rxdb": 1,
                "rxid": 0,
                "rxn": ""
            },
            "physics": {
                "bodies": [${LEVEL_DATA.bodies}],
                "bro": [${LEVEL_DATA.bro}],
                "fixtures": [${LEVEL_DATA.fixtures}],
                "joints": [],
                "ppm": 12,
                "shapes": [${LEVEL_DATA.shapes}]
            },
            "s": {
                "fl": false,
                "gd": 25,
                "nc": false,
                "pq": 1,
                "re": false
            },
            "spawns": [],
            "v": 15
        }`;
    }
}

const GEO_DATA = {
    SHAPES: [],
    DIMEN: {
        x: 0,
        y: 0
    }
}

function main(path) {
    let name = path.split('\\');
    LEVEL_DATA.name = name[name.length - 1].split('.json')[0];
    let GEOJSON = JSON.parse(fs.readFileSync(path));
    GEO_DATA.SHAPES = GEOJSON.shapes;
    GEO_DATA.DIMEN = {
        x: GEO_DATA["SHAPES"][0].data[2],
        y: GEO_DATA["SHAPES"][0].data[3]
    }
    LEVEL_DATA.DOWNSCALE = GEO_DATA.DIMEN.y / 500;
    const ACTIONS = [
        () => { LEVEL_DATA.shapes = LEVEL_DATA.shapes.reverse(); console.log(`(Shape order flipped)`) },
        () => { Generators.SHAPES(); console.log(`Shape generation finished.\nShape count: ${LEVEL_DATA.shapes.length} `) },
        () => { Generators.FIXTURES(); console.log(`Fixture generation finished.`) },
        () => { Generators.BODIES(); console.log(`Body generation finished.`) },
        () => { Generators.BRO(); console.log(`Bro generation finished.`) },
        () => { LEVEL_DATA.bro.reverse(); console.log(`Bro order flipped.`) },
        () => { fs.writeFileSync(`${__dirname}/out/${name}-out.json`, pretty(LEVEL_DATA.map), "utf-8"); console.log(`Saved map :3`) }];
    ACTIONS.forEach((action) => action())
}

// main('E:\\Archiving\\bonk.io\\Maps\\Geometrize Source Files\\Irbis.json');
// call the main method with path to your Geometrize JSON file! your bonk mapdata will be in the out field.