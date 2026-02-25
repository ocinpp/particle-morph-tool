attribute vec3 aStartPosition;
attribute vec3 aEndPosition;
attribute vec3 aColorStart;
attribute vec3 aColorEnd;
attribute float aRandomOffset;

uniform float uProgress;
uniform float uTime;
uniform float uSmoothColors;
uniform float uGrayscale;
uniform float uTransitionMode;
uniform float uEasingMode;
uniform float uPointSize;
uniform vec3 uMouse;
uniform float uMouseMode;
uniform float uMouseRadius;
uniform float uMouseStrength;

varying vec3 vColor;

float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}

void main() {
    float delay = aRandomOffset * 0.3; // MAX_DELAY
    float p_raw = uProgress - delay;
    float p = clamp(p_raw, 0.0, 1.0);

    // Easing functions based on mode
    float pEased;
    if (uEasingMode < 0.5) {
        // Ease In-Out (cubic) - default
        pEased = p < 0.5 ? 4.0 * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 3.0) / 2.0;
    } else if (uEasingMode < 1.5) {
        // Linear
        pEased = p;
    } else if (uEasingMode < 2.5) {
        // Ease In (cubic)
        pEased = p * p * p;
    } else if (uEasingMode < 3.5) {
        // Ease Out (cubic)
        pEased = 1.0 - pow(1.0 - p, 3.0);
    } else if (uEasingMode < 4.5) {
        // Bounce
        float n1 = 7.5625;
        float d1 = 2.75;
        if (p < 1.0 / d1) {
            pEased = n1 * p * p;
        } else if (p < 2.0 / d1) {
            float t = p - 1.5 / d1;
            pEased = n1 * t * t + 0.75;
        } else if (p < 2.5 / d1) {
            float t = p - 2.25 / d1;
            pEased = n1 * t * t + 0.9375;
        } else {
            float t = p - 2.625 / d1;
            pEased = n1 * t * t + 0.984375;
        }
    } else {
        // Elastic
        float c4 = (2.0 * 3.14159) / 3.0;
        pEased = p == 0.0 ? 0.0 : p == 1.0 ? 1.0
            : pow(2.0, 10.0 * p - 10.0) * sin((p * 10.0 - 10.75) * c4);
    }

    vec3 pos = mix(aStartPosition, aEndPosition, pEased);

    // Apply transition effect based on mode
    if (uTransitionMode < 0.5) {
        // DEFAULT: current chaos/swirl effect
        float chaosPower = sin(p * 3.14159) * 1.5;
        vec3 swirl = vec3(
            noise(vec3(pos.xy * 5.0, uTime)),
            noise(vec3(pos.yz * 5.0, uTime)),
            noise(vec3(pos.xz * 5.0, uTime))
        );
        pos += (swirl - 0.5) * chaosPower * aRandomOffset;
    } else if (uTransitionMode < 1.5) {
        // SPIRAL VORTEX
        float angle = p * 6.28 * 2.0; // 2 full rotations
        float radius = length(pos.xy);
        float originalAngle = atan(pos.y, pos.x);
        pos.x = radius * cos(originalAngle + angle);
        pos.y = radius * sin(originalAngle + angle);
        pos.z += sin(p * 3.14159) * 50.0 * aRandomOffset;
    } else if (uTransitionMode < 2.5) {
        // EXPLOSION
        float power = sin(p * 3.14159) * 200.0 * aRandomOffset;
        vec3 dir = normalize(pos + vec3(0.001));
        pos += dir * power;
    } else {
        // REVERSE GRAVITY (Fireworks)
        float peak = sin(p * 3.14159);
        vec3 up = vec3(pos.x * 0.3, 100.0, pos.z * 0.3);
        pos += up * peak * aRandomOffset;
    }

    // Mouse interaction
    if (uMouseMode > 0.5) {
        vec3 toMouse = pos - uMouse;
        float dist = length(toMouse);
        if (dist < uMouseRadius && dist > 0.001) {
            float strength = (1.0 - dist / uMouseRadius) * uMouseStrength;
            vec3 direction = normalize(toMouse);
            // Mode 1 = attract (toward mouse), Mode 2 = repel (away from mouse)
            pos += direction * strength * (uMouseMode > 1.5 ? 1.0 : -1.0);
        }
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uPointSize * (300.0 / -mvPosition.z);

    if (uSmoothColors > 0.5) {
        vColor = mix(aColorStart, aColorEnd, p);
    } else {
        if (p < 0.5) {
            vColor = aColorStart;
        } else {
            vColor = aColorEnd;
        }
    }

    if (uGrayscale > 0.5) {
        float gray = dot(vColor, vec3(0.299, 0.587, 0.114));
        vColor = vec3(gray);
    }
}
