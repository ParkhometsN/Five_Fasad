export function MainSlider(){
   const SliderContainer = document.querySelector('.slider_open_card');
   const ButtonCard = document.getElementById('card')
   ButtonCard.addEventListener('click', function(){
    SliderContainer.style.display = 'inline'
   })
   SliderContainer.addEventListener('click', function(){
    SliderContainer.style.display = 'none'
   })
}