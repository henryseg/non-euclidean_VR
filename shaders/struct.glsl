/**
 * A simple 3x3 gaussian convolution filter, non-separated version
 * @author Sebastian Schaefer
 * @date 2012
 * @namespace GLSL::FILTER::BLUR
 * @class Gauss3x3
 */
#version 150 core

uniform sampler2D image; ///< the input image

in vec2 tex;    ///< texture coordinated
out vec4 color; ///< the color output

/**
 * The main routine: read the 3x3 neighbours and multiply with kernel
 */
void main()
{

}
