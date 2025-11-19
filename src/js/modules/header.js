export function GetHeader (){
    const header = document.getElementById('header')
    const htmlHeader = `
    <div class="main_header_positon">
                <div class="headerfix">
                    <div  class="header-container stroke_main">
                        <div class="header-content">
                            <a  href="index.html" class="logo"><img src="./src/assests/svg/main_logotype.svg" alt="логотип пятого фасада"><h3>ПЯТЫЙ ФАСАД</h3> </a>
                            <nav class="navigation">
                                <li><a href="index.html"><h4>главная</h4></a></li>
                                <li><a href="Portfolio.html"><h4>портфолио</h4></a></li>
                                <li><a href="AboutUs.html"><h4>о компании</h4></a></li>
                                <li><a href="#footer"><h4>котнтакты</h4></a></li>
                                <li><a href="#"><h4>партнерство</h4></a></li>
                            </nav>
                            <div class="burgerbutton">
                                <input class="burgerclose" type="checkbox" id="checkbox">
                                <label for="checkbox" class="toggle">
                                    <div class="bars" id="bar1"></div>
                                    <div class="bars" id="bar2"></div>
                                    <div class="bars" id="bar3"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mobilefix">
                    <div class="header_mobile stroke_main">
                        <nav class="mobile">
                            <li><a href="index.html"><h4>главная</h4></a></li>
                            <li><a href="Portfolio.html"><h4>портфолио</h4></a></li>
                            <li><a href="AboutUs.html"><h4>о компании</h4></a></li>
                            <li><a href="#footer"><h4>котнтакты</h4></a></li>
                            <li><a href="#"><h4>партнерство</h4></a></li>
                        </nav>
                    </div>
                </div>
            </div>
    `
    header.innerHTML = htmlHeader
    OpenBurgerMenu()
}
function OpenBurgerMenu (){
    const MobileBurger = document.querySelector('.header_mobile')
    const ButtonOpenBurger = document.getElementById('checkbox')
    let isvisible = false
    ButtonOpenBurger.addEventListener('click', function() {
        if (isvisible) {
            MobileBurger.style.display = 'none' 
        } else {
            MobileBurger.style.display = 'block' 
        }
        isvisible = !isvisible
    })
}
