/*
 Copyright (c) 2013, robert.r.h.vella@gmail.com
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 The views and conclusions contained in the software and documentation are those
 of the authors and should not be interpreted as representing official policies,
 either expressed or implied, of the FreeBSD Project.
 */


$(document).ready(function () {
    "use strict";

    var numberOfGames = 200;
    var asteroidsGame = new asteroids.AsteroidsGame({ width: 800, height: 600 });

    var gamesWon = 0;

    var i;

    for (i = 0; i < numberOfGames; i += 1) {
        var stats = asteroidsGame.playGame();

        gamesWon += (stats.gameWon === true) ? 1 : 0;
    }

    var ratioOfGamesWon = gamesWon / numberOfGames;
    var confidenceLevel = 0.95;

    var marginOfError = 1.96 / (2 * Math.sqrt(numberOfGames));

    var formatAsPercentage = function (ratio) {
        return ratio.toFixed(2) * 100 + "%";
    };

    $("div#numberOfGames").text(numberOfGames);
    $("div#percentageOfGamesWon").text(formatAsPercentage(ratioOfGamesWon));
    $("div#confidenceLevel").text(formatAsPercentage(confidenceLevel));
    $("div#marginOfError").text(formatAsPercentage(marginOfError));
});
