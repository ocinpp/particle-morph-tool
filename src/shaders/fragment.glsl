varying vec3 vColor;
uniform float uOpacity;
uniform float uBrightness;
uniform float uSaturation;
uniform float uHueShift;
uniform float uInvert;

// Convert RGB to HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * uOpacity;

    // Apply brightness
    vec3 color = vColor * uBrightness;

    // Apply hue shift
    if (uHueShift > 0.0) {
        vec3 hsv = rgb2hsv(color);
        hsv.x = fract(hsv.x + uHueShift);
        color = hsv2rgb(hsv);
    }

    // Apply invert
    if (uInvert > 0.5) {
        color = vec3(1.0) - color;
    }

    // Apply saturation (grayscale luminance mix)
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, uSaturation);

    gl_FragColor = vec4(color, alpha);
}
