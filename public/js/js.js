const img1 = document.querySelector('.img1')
const img2 = document.querySelector('.img2')
const key = document.querySelector('#key')


const password = document.querySelector('#password')





img1.addEventListener('click', function () {
    img1.replaceWith(img2);
    img2.style.display = "block";
    key.style.display = "block";



})


img2.addEventListener('click', function () {
    img2.replaceWith(img1);
    key.style.display = "none";

})


$('.carousel').slick(
    {
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3000,
    }
);

function copy(that) {
    var inp = document.createElement('input');
    document.body.appendChild(inp)
    inp.value = that.textContent
    inp.select();
    document.execCommand('copy', false);
    inp.remove();


}










