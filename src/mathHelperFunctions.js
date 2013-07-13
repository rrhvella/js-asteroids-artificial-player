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

define([], function () {
    "use strict";

    var moddef = {};

    moddef.normalizeAngle = function (angle) {
        var twoPI = Math.PI * 2;

        angle = angle % twoPI;

        if (angle < 0) {
            angle += twoPI;
        }

        return angle;
    };

    moddef.minAngularDifference = function (angle1, angle2) {
        var angle1Normalized = moddef.normalizeAngle(angle1);
        var angle2Normalized = moddef.normalizeAngle(angle2);

        var difference = Math.abs(angle1Normalized - angle2Normalized);

        if (difference > Math.PI) {
            var smallerAngle = angle1Normalized;
            var largerAngle = angle2Normalized;

            if (angle1Normalized > angle2Normalized) {
                smallerAngle = angle2Normalized;
                largerAngle = angle1Normalized;
            }

            difference = smallerAngle + 2 * Math.PI - largerAngle;
        }

        return difference;
    };

    return moddef;
});

