export function GetFooter(){
    const ContainerFooter = document.getElementById('footer_item')
    const FooterHtml = `
        <div id="footer" class="footer_container">
                <div class="footer_content stroke_main">
                    <div class="footer_cc">
                        <div  class="img_mockup">
                            <img  src="./src/assests/img/footerclik.png" alt="рулетка пятого фасада">
                        </div>
                        <div class="textfooter">
                            <h1>От замеров до <br>
                                идеального потолка
                            </h1>
                            <h4>Наш результат — это безупречный потолок, который смонтирован чисто и точно в срок. Используем только сертифицированные материалы и современное оборудование.
                            </h4>
                            <button  style="width: 128px;" class="default_button buttonfoter"><h4>связаться</h4></button>
                        </div>
                        <div class="partners stroke_main">
                            <div class="partners_content">
                                <div class="frline">
                                    <img src="./src/assests/svg/icon_partnerone.svg" alt="партнеры пятого фасада">
                                    <img src="./src/assests/svg/icon_partnertwo.svg" alt="партнеры пятого фасада">
                                    <img src="./src/assests/svg/icon_partner_three.svg" alt="партнеры пятого фасада">
                                    <img src="./src/assests/svg/icon_partner_four.svg" alt="партнеры пятого фасада">
                                </div>
                                <div style="padding-top: 20px;" class="secline">
                                    <img src="./src/assests/svg/icon_partner_five.svg" alt="партнеры пятого фасада">
                                    <button class="black_button icon_custom"><img src="./src/assests/svg/plus.svg"><h4>Стать партнером</h4></button>
                                </div>
                            </div>
                        </div>
                        <div class="contacts_footer_information">
                            <div class="frlineinf"><h3>© 2025 Пятый фасад. Все права защищены. fivefasad@gmail.com</h3></div>
                            <div class="seclineinf">
                                <nav class="foter_navigation">
                                    <li><a href="index.html"><h4>главная</h4></a></li>
                                    <li><a href="Portfolio.html"><h4>портфолио</h4></a></li>
                                    <li><a href="AboutUs.html"><h4>о компании</h4></a></li>
                                </nav>
                                <a href="#hero"><button class="button">
                                <svg class="svgIcon" viewBox="0 0 384 512">
                                    <path
                                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                                    ></path>
                                    </svg>
                                </button></a>
                            </div>
                            <div class="threlineinf">
                                <a style="font-size: 12px;" href="tel:+77778889900">+8 (800) 555 35 - 35</a>
                                <a href="./politics.html"><h5>Политика конфиденциальности</h5></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `
    ContainerFooter.innerHTML = FooterHtml
}