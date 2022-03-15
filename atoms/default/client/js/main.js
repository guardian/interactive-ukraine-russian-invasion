/**** INTERACTIVE ****/ 

var el = document.createElement('script');
el.src = '<%= atomPath %>/app.js';
document.body.appendChild(el);

/**** ARTICLE PAGE ****/ 

// const styles = [].slice.apply(document.querySelectorAll("style"));
// const wrapper = document.querySelector("#scrolly-1");
// const parentPage = window.parent.document;

// styles.forEach((style) => {
//   parentPage.body.appendChild(style);
// });

// window.frameElement.parentNode.innerHTML = wrapper.outerHTML;

// var el = parentPage.createElement("script");
// el.src = "<%= atomPath %>/app.js";
// parentPage.body.appendChild(el);

/**** EVERYTHING ELSE ****/ 

setTimeout(() => {
  if (window.resize) {  
    const html = document.querySelector('html')
    const body = document.querySelector('body')
  
    html.style.overflow = 'hidden'
    html.style.margin = '0px'
    html.style.padding = '0px'
  
    body.style.overflow = 'hidden'
    body.style.margin = '0px'
    body.style.padding = '0px'
  
  window.resize()
  }
  // Detect vertical scrollbar width and assign to css variable for sizing full viewport width elements
  document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");
  document.documentElement.style.setProperty('--half-scrollbar-width', ((window.innerWidth - document.documentElement.clientWidth) / 2) + "px");
},100)