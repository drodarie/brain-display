// Shader for brain regions


export let MeshBlendShader = {
    uniforms: {
        totRGB: {type: 'f', value: 0.0},
        camVx: {type: 'f', value: 1.0},
        camVy: {type: 'f', value: 0.0},
        camVz: {type: 'f', value: 0.0}
    },

    vertexShader: [
        "attribute float caR; attribute float caG; attribute float caB;",
        "uniform float camVx; uniform float camVy; uniform float camVz; uniform float totRGB;",
        "varying vec4 vC; varying vec3 vcamV; varying vec3 vNormal; varying float totRGBf;",
        "void main() {",
            "totRGBf = totRGB;",
            "vcamV = normalize(vec3(camVx,camVy,camVz));",
            "vNormal = normalize(normal);",
            "vC = vec4(caR, caG, caB, 1.0);",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 color;",
        "varying vec4 vC; varying vec3 vcamV; varying vec3 vNormal; varying float totRGBf;",
        "void main() {",
            "float cam2norm = abs(vNormal.x * vcamV.x + vNormal.y * vcamV.y + vNormal.z * vcamV.z );",
            "if(totRGBf<0.5){",
                "gl_FragColor = (1.0 - 1.0 * cam2norm) * vC;",
            "}",
            "else {",
                "gl_FragColor = (cam2norm) * vC + (1.0 - vC);",
            "}",
        "}"
    ].join("\n")
};
