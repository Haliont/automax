//Всплывашка корзины
$(".js-show-basket").click(function(e) {
  $('.basket__product-wrap').addClass('_active');
  return false;
})

$(".js-hide-basket").click(function() {
  $('.basket__product-wrap').removeClass('_active');
})

