/***********************************************************************************************************************
 * @struct
 * Path Tracer Camera.
 * Mostly used to carry all informations linked to the camera (minDist, maxDist, maxSteps, etc)
 **********************************************************************************************************************/
struct PathTracerCamera {
    float fov;/**< field of view */
    float minDist;/**< minimal distance we ray-march */
    float maxDist;/**< maximal distance we ray-march */
    int maxSteps;/**< maximal number of steps during the ray-marching */
    float safetyDist; /**< safety distance to avoid collision with objects attached to the camera */
    float threshold;/**< threshold to stop the ray-marching */
    RelPosition position;/**< position of the camera (independent of the camera orientation in VR) */
    mat4 matrix;/**< orientation of the camera (mostly for VR) */
    float focalLength;/**< focal length */
    float aperture;/**< aperture */
};