import {
    noise
} from './perlin.js';
// debugger;

// "borrowed" from https://josephg.com/perlin/3/

function gaussianRand() {
    let rand = 0;

    for (var i = 0; i < 4; i += 1) {
        rand += Math.random();
    }

    return rand / 4;
}

// https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function resize(canvas) {
    // // Lookup the size the browser is displaying the canvas.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    // cgl. viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function randomArray(length, max) {
    return Array.apply(null, Array(length)).map(function() {
        return Math.round(Math.random() * max);
    });
}

function generateThumb(canvas_id, time) {
    var TAU, button, canvas, ctx, draw, f, fpselem, h, particles, period, raf, w, n_points;
    // var ncalls = 0;
    // var total_calls = 10;


    canvas = document.getElementById(canvas_id);
    let class_list = $(canvas)[0].classList;
    // debugger;
    fpselem = document.getElementById('fps');

    w = canvas.width = $(canvas).parent().width();

    h = canvas.height = $(canvas).parent().height();


    TAU = 20 * Math.PI;

    ctx = canvas.getContext('2d');

    period = 1 / 200;

    ctx.fillStyle = "#0B0B0B";

    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(1,1,1,0.3)';
    // debugger;
    var seed = noise.seed(Math.random());

	// debugger;

    // var mode = "offset";
    let x_generator, y_generator;
    let period_movement = $(canvas).attr('movementPeriod');
    let tau_movement = $(canvas).attr('movementTau');

	if (typeof period_movement === 'undefined'){
	period_movement = 0;
}
	if (typeof tau_movement === 'undefined'){
	tau_movement = 0;
}


    // n_points = $(canvas).attr('nPoints');
	// if (typeof n_points === 'undefined'){
	n_points = 100;
// }
    let p_new_seed = $(canvas).attr('pNewSeed');
	if (typeof p_new_seed === 'undefined'){
		p_new_seed = 0;
	} else {
		p_new_seed = parseFloat(p_new_seed);
	}

	let p_period = $(canvas).attr('pPeriod');
	if (typeof p_period === 'undefined'){
		p_period = 1;
	} else {
		p_period = parseFloat(p_period);
	}

		let speed = $(canvas).attr('speed');
	// if (typeof speed === 'undefined'){
		speed = 0.05;
	// } else {
		// speed = parseFloat(speed);
	// }

    if (class_list.contains('generative-thumbnail')) {
        n_points = 1000;
        period_movement = 0;
        tau_movement = 0;
    };

    // x, y type of randomness to use
    let randomness;
    if (class_list.contains('random-gaussian')) {
        randomness = gaussianRand;
    } else if (class_list.contains('random-simplex')) {
        // https://www.w3schools.com/js/js_function_closures.asp
        randomness = (function() {
            var seed = noise.seed(Math.random());
            return function() {
                var rand = (noise.simplex2(Math.random() * w, Math.random() * h, seed.perm, seed.gradP) + 1) / 2;
                return rand
            };
        })();
    } else {
        randomness = Math.random;
    };

    // 
    if (class_list.contains('initialization-full')) {
        x_generator = function() {
            return (randomness() * w);
        };
        y_generator = function() {
            return (randomness() * h);
        };
    } else if (class_list.contains('initialization-clumped') || true) {
        x_generator = (function() {
            const seed_x = (gaussianRand() * w * 0.5) + (Math.random() * w * 0.25);
            const spread_x = (Math.random() * 0.2) + 0.8;
            return function() {
                return ((seed_x + ((gaussianRand() - 0.5) * spread_x * w)));
            };
        })();

        y_generator = (function() {
            const seed_y = (gaussianRand() * h * 0.5) + (Math.random() * h * 0.25);
            const spread_y = (Math.random() * 0.2) + 0.8;
            return function() {
                return ((seed_y + ((gaussianRand() - 0.5) * spread_y * h)));
            };
        })();
    }

    let gen_mode = "all";
    if (class_list.contains('generation-sequential')) {
        gen_mode = "seq";
    };

    let seq_n = $(canvas).attr('nSeq');
	if (typeof seq_n === "undefined"){
		seq_n = 1;
	}





	function generate_points(x_generator, y_generator, n_points, particles = []) {
	    for (let _i = 1; _i <= n_points; _i++) {

	        let p1 = {
	            x: x_generator(),
	            // y: h / 2 + Math.random() * 50,
	            y: y_generator(),
	            xv: 0, // x velocity
	            yv: 0, // y velocity
	            // x: Math.random()*w,
	            // y: Math.random()*h,
	            a: 0,
                size: 0,
                intspeed: (Math.random()+1)**1.5
	        };
	        particles.push(p1);
	        particles.push({
	            x: p1.x,
	            y: 0, // x velocity
                xv: 0,
	            yv: 0, // y velocity
	            a: TAU / 2,
                size: 0,
                intspeed: (Math.random()+1)**2
	        });
	    }
	    return (particles);
	}


    if (gen_mode === "seq") {
        particles = generate_points(x_generator, y_generator, seq_n);
    } else if (gen_mode === "all" || true) {
        particles = generate_points(x_generator, y_generator, n_points);
    }

    let x_scene_momentum=0, y_scene_momentum=0, x_shift=0, y_shift=0, scene_angle=0;

    var frame = 0;

    let max_speed = 0;
    let current_speed = 0;


    draw = function() {
    	frame++;
        var a, p, v, _j, _len, _results;
        _results = [];
        resize(canvas);
        // ctx.fillStyle = "#0B0B0B01";
        if (frame % 20 == 0){
        ctx.fillStyle = "rgba(0,0,0,.04)";
    	ctx.fillRect(0, 0, w, h);
    }

    	// ctx.fillRect(0, 0, w, h);

    	// scene_angle += (Math.random()-0.5);
    	if (Math.random()<0.05){
    	x_scene_momentum += (Math.random()-0.5)*0.5;
    	y_scene_momentum += (Math.random()-0.5)*0.5;
    }
    if (frame % 30 == 0){
    	x_scene_momentum = x_scene_momentum*.95;
    	y_scene_momentum = y_scene_momentum*.95;
    }
    	// x_shift += Math.cos(scene_angle);
    	y_shift += y_scene_momentum;
    	
    	x_shift += x_scene_momentum;

        if (Math.random()<p_new_seed){
        	// debugger;
        	seed = noise.seed(Math.random());
        }

        if (Math.random()<p_period){
        	period += (Math.random()-0.5) * period_movement;
    	}
        TAU += (Math.random()-0.5)*tau_movement;

        if (gen_mode === "seq") {
            if (particles.length < n_points) {
                particles = generate_points(x_generator, y_generator, seq_n, particles);
            }
        }

        let off_course = (Math.random()-0.5)*30;
        let p_wayward = 0.005;

        max_speed = 0;
        current_speed = 0;


        for (_j = 0, _len = particles.length; _j < _len; _j++) {
            p = particles[_j];

            current_speed = (Math.abs(p.xv)+Math.abs(p.yv))/2;
            max_speed = Math.max(current_speed, max_speed);
            p.size = Math.ceil(((1-(current_speed/max_speed))**5)*40+(p.intspeed));

            v = noise.perlin2((p.x+x_shift) * period, (p.y+y_shift) * period, seed.perm, seed.gradP);
            ctx.fillStyle = "hsla(" + (Math.floor(v * 360)) + ", "+(Math.floor((_j/particles.length)*100))+"%, 50%, 0." +(40-p.size)+")";
            // p.shape.moveTo(p.x, p.y);
            // console.log((p.x+p.x)/2);
            // p.shape.arc(p.x, p.y,1+Math.ceil(5*(current_speed/max_speed)), 0, 2 * Math.PI);
            ctx.beginPath();
            ctx.arc(p.x, p.y,p.size, 0, 2 * Math.PI);
            // circle.arc(p.x, p.y, 1/((p.xv+p.xy)/2), 0, 2 * Math.PI);
            ctx.fill();
            // debugger;
            // ctx.fillRect(p.x, p.y, 2, 2);

            if (Math.random()<p_wayward){
            	v += off_course;
        	}
            p.h++;

            p.xv = p.xv*0.8;
            p.yv = p.yv*0.8;

            a = v * 2 * Math.PI + p.a;
            if (Math.random()<p_wayward){
			p.xv += Math.cos(a)*1;
            p.yv += Math.sin(a)*1;
            p.x += p.xv*speed;
            p.y += p.yv*speed;
            }else {
            p.xv += Math.cos(a)*0.3*p.intspeed;
            p.yv += Math.sin(a)*0.3*p.intspeed;
            p.x += p.xv*speed*p.intspeed;
            p.y += p.yv*speed*p.intspeed;
        }

            if (gen_mode == "seq"){
            	if (p.x < 0 || p.x > w || p.y < 0 || p.y > h){
            		particles.splice(_j, 1);
            	}
            } else {
            if (p.x < 0){
            	p.x = w;
            } else if (p.x > w){
            	p.x = 0;
            };
            
            if (p.y < 0){
            	p.y = h;
            } else if (p.y > h){
            	p.y = 0;
            }
        }

            _results.push(p.y);
        }
        return _results;
    };

    raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        // if (ncalls < total_calls){
        return window.setTimeout(callback, 1000 / 30);
        // }
        // ncalls += 1;
    };

    // button = document.getElementsByTagName('input')[0];

    // button.onclick = function() {
    //   return window.open(canvas.toDataURL('image/png'));
    // };

    f = function() {
        // if (ncalls < total_calls){
        raf(f);

        return draw();
        // } 
        // ncalls += 1
    };

    setTimeout(function() {
        raf(f);
    }, time);
    // console.log(time);
};



$(function() {
    let time = 0;
    const time_delta = 200;
    $('.generative').each(function() {
        // var this_div = $(this)[0].id;
        // var parentname = this_div[0].id;
        // debugger;
        generateThumb($(this)[0].id, time);
        time += time_delta;
        // $(this).resize(function(){
        // 	$(this).width($(this).parent().width());
        // 	$(this).height($(this).parent().height());
        // })

    });

    // $('.generative').width($('.generative').parent().width());
    // $('.generative').height($('.generative').parent().height());

    $(window).resize(function() {
        $('.generative').width($('.generative').parent().width());
        $('.generative').height($('.generative').parent().height());
    });

});