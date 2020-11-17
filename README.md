# non-euclidean_VR

Non-euclidean VR

Based on the ray marching hyperbolic virtual reality simulation (for mobile devices) by Henry Segerman and Michael Woodard at https://github.com/mtwoodard/hypVR-Ray_m,
which is in turn based on the full simulation at https://github.com/mtwoodard/hypVR-Ray. 

The intention is that this version is as independent of the underlying geometry as possible. Different branches of this project will simulate different geometries, e.g. the other eight Thurston geometries.

This project started at the Illustrating Mathematics semester program at ICERM (https://icerm.brown.edu). Henry Segerman is partially supported by NSF grant DMS-1708239. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.

# Controls
Use arrow keys to move and "wasd" to rotate the camera. "q" and "e" roll the camera. 

# Running Locally
Running this locally requires a simple web server (to source the shader files at runtime), with the root at the same level as index.html. This can be done in python 3 by running the command "python -m http.server". On Windows, you can set up a server in the Control Panel Administrative Tools, in the IIS Manager (you may need to turn this feature on first). NOTE: The server will need to have a MIME type configuration for .glsl files set to "text/plain".

# Done or in progress
S^3, E^3, H^3, S^2 x R, H^2 x R, Nil, Sol, and SL(2,R)

# Licence

Released under the terms of the GNU [General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html), version 3 or later.
