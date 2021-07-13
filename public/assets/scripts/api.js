const PICTURE_OF_THE_DAY = "https://api.nasa.gov/planetary/apod?api_key=T5RcXD3s6gECrDjPRmoYHqzEOFxOlkIfcEDoSdSx"

;
(function getData() {
    if (!sessionStorage.getItem("image")) {
        jQuery(function() {
            jQuery.get(PICTURE_OF_THE_DAY, function(data) {
                sessionStorage.setItem('image', data.hdurl)
            })
        })
    }
})()

setBackground()
setTimeout(() => {
    setBackground()
}, 800)

function setBackground() {
    jQuery(function() {
        $('body').css('background', 'url(' + sessionStorage.getItem('image') + ')')
        $('#img-link').attr('href', sessionStorage.getItem('image'))
    })
}