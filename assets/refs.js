//----references tooltips code----
//declare variables
let numwidth = 25; //width of the number column of the references table in px
let overTO;
let leaveTO;
let refVisible = false;
let tgt;
let tgtRect;
let ttRect;
let xar = 0;
let yar = 0;
let xtt = 0;
let ytt = 0;

//add a placeholder div for the tooltip
let ttDiv= $('<div id="ref-tooltip" class="ref-tooltip">  <div id="tt-content"></div><div id="tt-arrowInner"></div><div id="tt-arrowOuter"></div></div>').appendTo(document.body);

//format the reference table column widths
$("#reftable").append('<colgroup><col width = "'+numwidth+'px"/><col/></colgroup>');
//add a tbody element to add references to
let reftable = $('<tbody id="test"></tbody>').appendTo("#reftable");

//make sure all links in reference text are set to open in new tabs
$('.reference a').each(function(){
  $(this).attr('target','_blank');
});

//for each reference found in the text...
$('.reference').each(function(index,ref){
  //calculate its index - js starts at 0 but humans count from 1
  let refnum=index+1;
  //add a superscript reference number in square brackets, linked to the entry in the reference table
  $(this).after('<sup id="ref'+refnum+'" class="reflink"><a href="#ref'+refnum+'-num">['+refnum+']</a></sup>');
  //add a row to the reference table with the details
  reftable.append('<tr><td id="ref'+refnum+'-num"><a href="#ref'+refnum+'">'+refnum+'</td><td id="ref'+refnum+'-ref"></td></tr>');
 $('#ref'+refnum+'-ref').append($(this).contents());
});

//append mouseover/leave functions to references and tooltip, with time delay to allow hover behaviour
$(".reflink")
.mouseenter(function(){
  tgt = this;
  clearTimeout(leaveTO);
  if (refVisible){
    overTO = setTimeout(function(){refShow();}, 50);
  }
  else{
    overTO = setTimeout(function(){refShow();}, 200);
  }
})
.mouseleave(function(){
  clearTimeout(overTO);
  leaveTO = setTimeout(function(){refHide();}, 200);
});

ttDiv
.mouseenter(function(){
  //stop the timers to keep the tooltip visible
  clearTimeout(leaveTO);
  clearTimeout(overTO);
})
.mouseleave(function(){
  clearTimeout(overTO);
  leaveTO = setTimeout(function(){refHide(tgt);}, 200);
});

//function to show reference tooltip
function refShow(){
  //get the id of the reference, and clone the reference into the tooltip
  let id1 = tgt.id;
  $("#tt-content")
     .empty()
     .append($("#"+id1+"-ref").clone());
  ttDiv.css("display",'block');
  
  //position tooltip
  //get the reference coords
  tgtRect = tgt.getBoundingClientRect();
  //if it's close to the right edge of the screen, make sure tooltip sits in visible area
  if ((tgtRect.left+tgtRect.width/2-15+ttDiv.width()+5+11)<$(window).width()){
    //tooltip sits 10px left of the arrow
    xtt = tgtRect.left+tgtRect.width/2-15;
    //arrow sits centred relative to reference
    xar = tgtRect.left+tgtRect.width/2;
  }
  else{
    //tooltip sits with a 5px margin to the right
    //viewport width - 5px margin - width of tooltip - tooltip padding/border
    xtt = $(window).width()-5-ttDiv.width()-11;
    //arrow sits centred relative to reference
    xar = tgtRect.left+tgtRect.width/2;
  }
  
  //if there's space above reference in text to show tooltip, show it there, else show it below
  if ((tgtRect.top-10-5)>ttDiv.height()){
    ytt = tgtRect.top-10-ttDiv.height()-4;
    yar = tgtRect.top-5;
    //set arrow borders - top border for a down arrow - and set position
    $('#tt-arrowInner').css('border-color','#fff transparent transparent transparent')
    .css("left", xar + "px")
    .css("top", yar-0.3 + "px");
    $('#tt-arrowOuter').css('border-color','#ccc transparent transparent transparent')
    .css("left", xar + "px")
    .css("top", yar + "px");
  }
  else{
    ytt = tgtRect.top + tgtRect.height + 10;
    yar = tgtRect.top + tgtRect.height + 0;
    //set arrow borders - bottom border for an up arrow - and set position
    $('#tt-arrowInner').css('border-color','transparent transparent #fff transparent')
    .css("left", xar + "px")
    .css("top", yar+1.3 + "px");
    $('#tt-arrowOuter').css('border-color','transparent transparent #ccc transparent')
    .css("left", xar + "px")
    .css("top", yar-1 + "px");
    }
  //position and show tooltip
  ttDiv
    .css("left", xtt + "px")
    .css("top", ytt + "px")
    .css("display","block");
  refVisible=true; 
}

function refHide(){
  $("#ref-tooltip")
  .css("display", "none");
   $("#tt-content").empty();
  refVisible=false;
}
  
