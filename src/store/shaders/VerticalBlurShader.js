
export let VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"v":        { type: "f", value: 1.0 / 512.0 },
		"glowSc":   { type: "f", value: 0.0 }

	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",
		"uniform float glowSc;",

		"varying vec2 vUv;",

		"void main() {",
			"vec4 sum = vec4( 0.0 );",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 8.0 * v) ) * 0.03414088;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 7.0 * v) ) * 0.04132557;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 6.0 * v) ) * 0.0487645;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 5.0 * v) ) * 0.05609569;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v) ) * 0.06290657;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v) ) * 0.06877067;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v) ) * 0.07329111;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v) ) * 0.07614478;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y          ) ) * 0.07712048;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v) ) * 0.07614478;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v) ) * 0.07329111;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v) ) * 0.06877067;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v) ) * 0.06290657;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 5.0 * v) ) * 0.05609569;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 6.0 * v) ) * 0.0487645;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 7.0 * v) ) * 0.04132557;",
			"sum += texture( tDiffuse, vec2( vUv.x, vUv.y + 8.0 * v) ) * 0.03414088;",
			"gl_FragColor = sum*glowSc;",
		"}"

	].join("\n")
};
