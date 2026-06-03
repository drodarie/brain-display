/**
 * @author stemkoski / http://github.com/stemkoski
 *
 * Blend two textures additively
 */

export let AdditiveBlendShader = {
	uniforms: {
	
		"tDiffuse1": { type: "t", value: null },
		"tDiffuse2": { type: "t", value: null },
		"inv":       { type: "f", value: 1.0 }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",
		"uniform float inv;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			"gl_FragColor = vec4(texel1.rgb + inv * texel2.rgb, 1.0);",
		"}"
	].join("\n")
};
