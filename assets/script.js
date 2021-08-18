// ------ sticky nav bar ------

let stickySide = true;

if(window.innerWidth>990){

Stickyfill.add($('#nav'));

} else {

Stickyfill.add($('#navwrap'));

stickySide=false;

}


if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// -------- lightbox code --------

//append a placeholder div construct to the end of the page
let lbox = $('<div id="lbox"><img id="lboximg" src=""/></div>').appendTo(document.body);
let lboximg = $('#lboximg');

//add a function to toggle visibility of the lightbox and set the image source when an image is clicked
$('.imgContent').click(function(){
  lboximg.attr('src', this.src);
  lbox.fadeToggle(300);
});

//click anywhere in the lightbox image to toggle visibility back
lboximg.click(function(){
  lbox.fadeToggle(150);
}); 

// -------- cover animation code --------

const html = document.documentElement;
const coverScroll = document.getElementById("coverCanvas");
const coverDiv = document.getElementById("cover");
const context = coverScroll.getContext("2d");

const frameCount = 29;
function currentFrame(index) { 
  return 'https://dst-iris.github.io/calmbeforetheswarm/assets/'+index.toString()+'.jpg';
}

function preloadImages() {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
  }
}

const img = new Image()
img.src = currentFrame(1);
coverScroll.width = window.innerWidth;
coverScroll.height = window.innerHeight;

window.addEventListener('resize', function(event){

  coverScroll.width = window.innerWidth;
  coverScroll.height = window.innerHeight;
  const spacerDiv = document.getElementById("coverCanvas");

  if(window.innerWidth>990 && !stickySide){

    Stickyfill.remove($('#navwrap'));
    Stickyfill.add($('#nav'));
    stickySide=true;
    
    } else if (window.innerWidth<=990 && stickySide){

      Stickyfill.remove($('#nav'));
      Stickyfill.add($('#navwrap'));
        stickySide=false;
    
    }

});


img.onload = function(){
  // get the scale
   scale2 = Math.max(coverScroll.width / img.width, coverScroll.height / img.height);
  // get the top left position of the image
  var x = (coverScroll.width / 2) - (img.width / 2) * scale2;
  var y = (coverScroll.height / 2) - (img.height / 2) * scale2;
  context.drawImage(img, x, y, img.width * scale2, img.height * scale2);
}

function updateImage(index) {
  img.src = currentFrame(index);
  // get the scale
  var scale2 = Math.max(coverScroll.width / img.width, coverScroll.height / img.height);
  // get the top left position of the image
  var x = (coverScroll.width / 2) - (img.width / 2) * scale2;
  var y = (coverScroll.height / 2) - (img.height / 2) * scale2;
  context.drawImage(img, x, y, img.width * scale2, img.height * scale2);
}


let maxScrollTop = window.innerHeight;
let fadeScrollTop = window.innerHeight*0.75;


window.addEventListener('scroll', function() {  
  
  const scrollTop = html.scrollTop;

  if (scrollTop<=maxScrollTop){
  
  const scrollFraction = scrollTop / maxScrollTop;

  
  let fadeFraction = 1;
  if (scrollTop>fadeScrollTop){
    fadeFraction = 1-(scrollTop - fadeScrollTop)/(fadeScrollTop/3);
  }

  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(scrollFraction * frameCount)
  );
  coverDiv.style.display = "block";
  coverDiv.style.opacity = fadeFraction;
  
 updateImage(frameIndex + 1);

  } else {
    coverDiv.style.opacity = 0;
    coverDiv.style.display = "none";
  }
});


preloadImages();


