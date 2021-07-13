var timer = 0
var click = 0
var timeFunction;
var motifsCartes = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
var etatsCartes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var cartesRetournees = [];
var nbPairesTrouvees = 0;
var imgCartes = document.getElementById("tapis").getElementsByTagName("img");

function majAffichage(noCarte) {
    switch (etatsCartes[noCarte]) {
        case 0:
            imgCartes[noCarte].src = "/assets/images/cartes/fondcarte.png";
            break;
        case 1:
            imgCartes[noCarte].src = "/assets/images/cartes/carte" + motifsCartes[noCarte] + ".png";
            break;
        case -1:
            imgCartes[noCarte].style.visibility = "hidden";
            break;
    }
}

function initialiseJeu() {
    for (var i = 0; i < imgCartes.length; i++) {
        imgCartes[i].noCarte = i; //Ajout de la propriété noCarte à l'objet img
        imgCartes[i].onclick = function() {
            controleJeu(this.noCarte);
        }
    }
    timer = 0
    click = 0
    for (var position = motifsCartes.length - 1; position >= 1; position--) {
        var hasard = Math.floor(Math.random() * (position + 1));
        var sauve = motifsCartes[position];
        motifsCartes[position] = motifsCartes[hasard];
        motifsCartes[hasard] = sauve;
    }
}

function controleJeu(noCarte) {
    if (click == 0) {
        click++
        increaseTimer()
    }
    if (cartesRetournees.length < 2) {
        if (etatsCartes[noCarte] == 0) {
            etatsCartes[noCarte] = 1;
            cartesRetournees.push(noCarte);
            majAffichage(noCarte);
        }
        if (cartesRetournees.length == 2) {
            var nouveauEtat = 0;
            if (motifsCartes[cartesRetournees[0]] == motifsCartes[cartesRetournees[1]]) {
                nouveauEtat = -1;
                nbPairesTrouvees++;
            }

            etatsCartes[cartesRetournees[0]] = nouveauEtat;
            etatsCartes[cartesRetournees[1]] = nouveauEtat;
            setTimeout(function() {
                majAffichage(cartesRetournees[0]);
                majAffichage(cartesRetournees[1]);
                cartesRetournees = [];
                if (nbPairesTrouvees == 10) {
                    gameover()
                }
            }, 750);
        }
    }
}

jQuery(function() {
    $('#play').click(() => {
        $('#tapis').removeClass('visually-hidden')
        timer = 0
        click = 0
        timeFunction;
        motifsCartes = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
        etatsCartes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        cartesRetournees = [];
        nbPairesTrouvees = 0;
        replay()
        initialiseJeu()
        $('#play').html('Rejouer')
    })
})

function increaseTimer() {
    timeFunction = window.setInterval(function() {
        timer++
        $('#timer').html(pad(timer, 3))
    }, 1000)
}

function pad(num, size) {
    var s = "000" + num;
    return s.substr(s.length - size);
}

function replay() {
    if (timeFunction) {
        clearInterval(timeFunction)
    }
    click = 0
    $('#timer').html(pad(0, 3))
}

function gameover() {
    clearInterval(timeFunction)
    jQuery(function() {
        $('form').removeClass('visually-hidden')
        $('form').submit(function(event) {
            let score = 0
            100 - parseInt($('#timer').html()) >= 0 ? score = 100 - parseInt($('#timer').html()) : false
            var formData = {
                game: $('#game').data('id'),
                score: score
            }
            console.log(formData, window.location)
            $.ajax({
                type: "POST",
                url: "/game/savescore",
                data: formData,
                dataType: "json",
                encode: true,
            }).done(function(data) {
                $('form').addClass('visually-hidden')
            })
            event.preventDefault();
        })
    })
}