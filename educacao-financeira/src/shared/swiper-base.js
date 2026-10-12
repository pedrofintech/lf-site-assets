import Swiper from 'swiper'
import { Pagination, Navigation, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

if (document.querySelector('.swiper-base')) {
  new Swiper('.swiper-base', {
    modules: [Pagination, Navigation, Keyboard],
    slidesPerView: 1,
    speed: 700,
    spaceBetween: 40,
    centeredSlides: false,
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + ' is-services-pagination">' + '</span>'
      },
    },
    navigation: {
      nextEl: '.base-next-arrow',
      prevEl: '.base-prev-arrow',
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
    },
    breakpoints: {
      0: { spaceBetween: 16, slidesPerView: 1 },
      1024: { spaceBetween: 40 },
      1400: { spaceBetween: 40 },
    },
  })
}
