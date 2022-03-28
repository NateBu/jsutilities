import { initialize_map } from "./zoom_pan_canvas.js";

// allowable objects:
// polygons => {draw_type:'polygon', points:[{x:0,y:0},{x:200,y:0},{x:200,y:200}],fillStyle:'red',strokeStyle:'rgba(0,0,0,0.5)'}
// circles => {draw_type:'circle', x:0, y:0, radius:10, fillStyle:'red',strokeStyle:'rgba(0,0,0,0.5)'}
// text => {draw_type:'text',fillText:'hi',font:'30px Arial',fillStyle:'red',textAlign:'center'}
// images => {draw_type:'image', x:0, y:0, w:100, h:100, rotation:1.57, image:img1}
    // x, y, position of bottom left corner, positive is rotation counter-clockwise around that point
    // var img1 = new Image();
    // img1.src = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAABGdBTUEAALGPC/xhBQAAAa1QTFRF5H444Ho14Xo15oQ45YQ45oI56os854Y443423HYtAAAA3HctzGAT9plE+qZM/eHE+bt///36/dy6+bVz+aFH/OHI/Nm1+aRP/vXr//jw5o9p/N/E/vPo9Kpw9bWD/vPq/vTs/enX/erW/MqV/ObT+8aR9ZM5+Zs7+sma4XRC+dGv98CR+LFs/dWt/vDh+9Ov+uDN+uDP/vj0/fDo9JRA8JFG9beG+ta686ds+6hQ+adV9ruN5oJN/PLt9MKj53Yx+qBC+J1C7qN599bD6IVM/O3h8Jxa97Bu//79+7Vu+Ld787mW/fTt8Jtf6oE78pA795c5/fPs64I77JRZ/NOq/Nu8/Lhv/unU/u7d3WQv4no343s3///++Zw995k843w3/vXt5XYy64s75H045oE45X846oo75oI554Q55YA46IU66IQ65oE56ok66IY654M56Yg62l0p3GAq3WMr5XMu6nwx53gv4Gcs/vv54mwt64Ay7YQz5HAu74c053Uv6Yc6+pw5+Jg48Ys084416Xow9JI27H8y9ZI3+Zo59pU374Y0+54695c48ow1////AGx8/AAAAA10Uk5T/fn5+fn9/fn5ywDLKOfV8VwAAAEpSURBVBjTVc5TcwMBFAXgWyVZ1LZt27YV2+aGm0YNNvc3d9PMdKbn8Xs45wBJEyKtwWi2s06bXi2kaBLoGpXX7wuFo4lkOsdlZQIaCJX3+elP4gU5BSKv/1F6uj69Upav72rQ+n03yKdnpixFFgy+0Nna1CCidPagJHkLGEPhVb6nuQNx7pCXjAPM4ahyoLuBa2lCnOclZQV7NKHkq+rrCm2IG5lUzARsInk+MYTY2V7bj8t3sYgOnKU/48ON2FrsRbyOBDVgS+ceLjcLo4h9mUU8DgYUoM9xL3ixNTaCC6k93A14JKDmsu+IV8VtXNo/Qpx0i0GYjb99vN7nbxnmZIdhulwVQMl+P/PrkWDA43Z9EkAL5P8EaCBpqoq1OKwmnUYhEVcSNPkD6BN5Z82OyewAAAAASUVORK5CYII=';
    
let draw_image = function(img, ctx) {
  ctx.save();
  ctx.translate(img.x, img.y);
  ctx.rotate(img.rotation);
  ctx.drawImage(img.image, 0, 0, img.w, img.h);
  ctx.restore();
}

let draw_polygon = function(poly, ctx) {
  if (poly.points.length < 2) return;
  let trnsfrm = ctx.get_transform();
  if (poly.lineWidth) ctx.lineWidth = poly.lineWidth / trnsfrm.a;
  if (poly.fillStyle) ctx.fillStyle = poly.fillStyle;
  if (poly.strokeStyle) ctx.strokeStyle = poly.strokeStyle
  ctx.beginPath();
  ctx.moveTo(poly.points[0].x, poly.points[0].y);
  poly.points.forEach(p => { ctx.lineTo(p.x, p.y); })
  if (poly.fillStyle) ctx.fill();
  if (poly.strokeStyle) ctx.stroke()
}

let draw_circle = function(circ, ctx) {
  let trnsfrm = ctx.get_transform();
  if (circ.lineWidth) ctx.lineWidth = circ.lineWidth * trnsfrm.a;
  if (circ.fillStyle) ctx.fillStyle = circ.fillStyle;
  if (circ.strokeStyle) ctx.strokeStyle = circ.strokeStyle;
  ctx.beginPath();
  let r = (circ.hasOwnProperty('radius')) ? circ.radius : circ.pixradius/trnsfrm.a;
  ctx.arc(circ.x, circ.y, r, 0, 2 * Math.PI, false);
  if (circ.fillStyle) ctx.fill();
  if (circ.strokeStyle || circ.lineWidth) ctx.stroke()
}

let draw_text = function(txt, ctx) {
  if (txt.font) ctx.font = txt.font; //"30px Arial";
  if (txt.fillStyle) ctx.fillStyle = txt.fillStyle; //"red";
  if (txt.strokeStyle) ctx.strokeStyle = txt.strokeStyle; //"red";
  if (txt.textAlign) ctx.textAlign = txt.textAlign; // "center"
  ctx.scale(1,-1);
  if (txt.fillText) ctx.fillText(txt.fillText, txt.x, -txt.y);
  if (txt.strokeText) ctx.fillText(txt.strokeText, txt.x, -txt.y);
  ctx.scale(1,-1);
}

let draw_thing = function(thing, ctx) {
  if (typeof(thing) == "object") {
    if (thing.hasOwnProperty('draw_type')) {
      if (thing.draw_type == 'polygon') {
        draw_polygon(thing,ctx);
      } else if (thing.draw_type == 'circle') {
        draw_circle(thing,ctx);
      } else if (thing.draw_type == 'text') {
        draw_text(thing,ctx);
      } else if (thing.draw_type == 'image') {
        draw_image(thing,ctx);
      }
    } else {
      for (const [key, val] of Object.entries(thing)) {
        if (Array.isArray(val)) {
          val.forEach(v => draw_thing(v, ctx));
        } else {
          draw_thing(val, ctx);
        }
      }  
    }
  }
}

let draw = function(ctx, data) {
  ctx.save();
  ctx.clear_all();
  ctx.scale(1,-1);
  ctx.draw_grid();
  ctx.draw_mouse();
  draw_thing(data, ctx);
  ctx.restore();
}

export function map_center(ctx, xc, yc, width,height) { // x, y, map coordinates of center and desired width/height
  let t = ctx.get_transform();
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let scl = Math.min(h/height, w/width);
  t.a = scl;
  t.d = scl;
  t.e = w/2 - xc*scl;
  t.f = yc*scl + h/2;
  ctx.set_transform(t);
}

export function setup_generic_map(contentdiv, DATA) {
  let CANVAS = document.createElement('canvas');
  let CTX = null;
  contentdiv.appendChild(CANVAS);
  const resize = function() {
    let transform = null;
    if (CTX) {
      transform = CTX.get_transform();
    }
    CTX = initialize_map(CANVAS);
    CANVAS.width = contentdiv.offsetWidth;
    CANVAS.height = contentdiv.offsetHeight;
    CTX.SCREEN.lastX=CANVAS.width/2, CTX.SCREEN.lastY=CANVAS.height/2;
    if (transform) CTX.set_transform(transform);
    draw(CTX, DATA);
  }
  resize();
  window.onresize = resize;
  CANVAS.addEventListener('mousedown',(e) => { 
    if (DATA.disable_map_events) return;
    CTX.handleMouseDown(e) 
  }, false);
  CANVAS.addEventListener('mousemove',(e) => { 
    if (DATA.disable_map_events) return;
    if (CTX.handleMouseMove(e)) {
      draw(CTX,DATA);
    } else {
      CTX.draw_mouse();
    }
  }, false);
  CANVAS.addEventListener('mouseup',(e) => { 
    // if (DATA.disable_map_events) return;
    CTX.handleMouseUp(e) 
  }, false);
  CANVAS.addEventListener('DOMMouseScroll',(e) => { 
    if (DATA.disable_map_events) return;
    CTX.handleScroll(e); draw(CTX,DATA);    
  }, false);
  CANVAS.addEventListener('mousewheel',(e) => { 
    if (DATA.disable_map_events) return;
    CTX.handleScroll(e); draw(CTX,DATA);        
  }, false);
  return {
    draw:() => { draw(CTX, DATA) },
    resize:() => { resize() },
    eventToPosition:(e) => { 
      let P = CTX.eventToPosition(e);
      P.y = -P.y; // because of the -1 scale applied above
      return P;
    },
    positionToScreen:(x,y) => {
      return CTX.positionToScreen(x,-y);
    },
    CANVAS:CANVAS,
    CTX:CTX
  };
}
