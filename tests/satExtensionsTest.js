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

(function () {
    "use strict";

    var Ray = SAT.Ray;
    var Circle = SAT.Circle;
    var Vector = SAT.Vector;

    test("testRayCircle returns false for ray with no direction.", function () {
        var ray = new Ray(new Vector(0, 0), new Vector(0, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns true for ray within the circle.", function () {
        var ray = new Ray(new Vector(0, 0), new Vector(1, 1));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for ray positioned on the circumference.", function () {
        var ray = new Ray(new Vector(10, 0), new Vector(1, 1));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for ray not facing the circle.", function () {
        var ray = new Ray(new Vector(11, 0), new Vector(1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for circle not on the ray's line.", function () {
        var ray = new Ray(new Vector(0, 11), new Vector(1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns true for ray facing the circle.", function () {
        var ray = new Ray(new Vector(11, 0), new Vector(-1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(SAT.testRayCircle(ray, circle));
    });
}());
