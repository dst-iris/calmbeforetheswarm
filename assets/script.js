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

let coverImg = document.getElementById("coverImage");
let coverDiv = document.getElementById("cover");

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

window.addEventListener('resize', function(event){

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


function updateImage(index) {
  coverImg.src = currentFrame(index);
}


let maxScrollTop = window.innerHeight;
let fadeScrollTop = window.innerHeight*0.75;


window.addEventListener('scroll', function() {  
  
  const scrollTop = document.documentElement.scrollTop;

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


