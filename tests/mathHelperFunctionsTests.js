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

define(["mathHelperFunctions"], function (mathHelperFunctions) {
    "use strict";

    var PI = Math.PI;
    var TWO_PI = Math.PI * 2;
    var HALF_PI = Math.PI / 2;

    test("normalizeAngle returns correct value for positive angle.", function () {
        equal(mathHelperFunctions.normalizeAngle(PI * 10), 0);
    });

    test("normalizeAngle returns angle which does not need to be normalized.", function () {
        equal(mathHelperFunctions.normalizeAngle(PI), PI);
    });

    test("normalizeAngle returns correct value for negative angle.", function () {
        equal(mathHelperFunctions.normalizeAngle(-PI), PI);
    });

    test("minAngularDistance returns 0 for two equal angles.", function () {
        equal(mathHelperFunctions.minAngularDifference(0, 0), 0);
        equal(mathHelperFunctions.minAngularDifference(1, 1), 0);
        equal(mathHelperFunctions.minAngularDifference(TWO_PI, TWO_PI), 0);
    });

    test("minAngularDistance returns correct value for angles between 0 and PI.", function () {
        equal(mathHelperFunctions.minAngularDifference(0, PI), PI);
        equal(mathHelperFunctions.minAngularDifference(0, HALF_PI), HALF_PI);
        equal(mathHelperFunctions.minAngularDifference(HALF_PI, PI), HALF_PI);
    });

    test("minAngularDistance returns correct value for angles which are overflown.",
        function () {
            equal(mathHelperFunctions.minAngularDifference(HALF_PI * 3, PI * 3), HALF_PI);
        }
    );

    test("minAngularDistance returns correct value for angles between 0 and 2PI.", function () {
        equal(mathHelperFunctions.minAngularDifference(PI * 1.75, PI * 0.25), HALF_PI);
    });

    test("minAngularDistance returns is commutative", function () {
        equal(mathHelperFunctions.minAngularDifference(PI, HALF_PI), HALF_PI);
    });
});
