let slideIndex = 0;
let timeoutId = null;
showSlides();
function autoSlides() {
plusSlides(1);
timeoutId = setTimeout(autoSlides, 3000);
}
function plusSlides(n) {
clearTimeout(timeoutId);
showSlides(slideIndex += n);
timeoutId = setTimeout(autoSlides, 3000);
}
function currentSlide(n) {
clearTimeout(timeoutId);
showSlides(slideIndex = n);
timeoutId = setTimeout(autoSlides, 3000);
}
function showSlides() {
let i;
let slides = document.getElementsByClassName("slide");
let dots = document.getElementsByClassName("dot");
if (slideIndex >= slides.length) { slideIndex = 0 }
if (slideIndex < 0) { slideIndex = slides.length - 1 }
for (i = 0; i < slides.length; i++) {
slides[i].style.display = "none";
}
for (i = 0; i < dots.length; i++) {
dots[i].className = dots[i].className.replace(" active", "");
}
slides[slideIndex].style.display = "block";
dots[slideIndex].className += " active";
}
timeoutId = setTimeout(autoSlides, 3000);