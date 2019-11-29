"""
Numeric integration of the geodesic flow
"""
from typing import Tuple, List

from numpy import ndarray, array, exp, sqrt, sin, cos, pi, arctan2
import SimpleITK as sitk

from .ode import Solver
from .toolbox import timer


class Flow(Solver):
    """
    Integrating the geodesic flow in Sol
    """

    def __init__(self, verbose: bool = False) -> None:
        """
        Constructor
        """
        Solver.__init__(self, 6, verbose=verbose)
        self.set_params(method='RK2')

    def field(self, t: float, p: ndarray) -> ndarray:
        """
        The vector field of the geodesic flow at the point p = (x,y,z,dx,dy,dz)
        :param t: the current time
        :param p: the current position
        :return: the vector field
        """
        x, y, z, dx, dy, dz = p

        d2x = 2 * dx * dz
        d2y = -2 * dy * dz
        d2z = -exp(-2 * z) * dx ** 2 + exp(2 * z) * dy ** 2

        return array([dx, dy, dz, d2x, d2y, d2z])

    def _normalization(self, t, p: ndarray) -> ndarray:
        """
        Normalization
        Make sure the the tangent vector has always norm 1 (for the Sol metric)
        :param t: the current time
        :param p: the current position p = (x,y,z,dx,dy,dz)
        :return: the normalized position
        """
        x, y, z, dx, dy, dz = p
        length = sqrt(exp(-2 * z) * dx ** 2 + exp(2 * z) * dy ** 2 + dz ** 2)
        return array([x, y, z, dx / length, dy / length, dz / length])

    @staticmethod
    def start(theta: float, phi: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector given by angle in spherical coordinates
        :param theta: latitude (or longitude never know which is one)
        :param phi: longitude (or latitude)
        :return: the initial position
        """
        return array([0, 0, 0, sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)])

    def texture_3d(self, theta_step: float, phi_step: float, time: float, time_step: float, coord: int) -> sitk.Image:
        """
        Return an 3D numpy array index by theta,phi,time
        :param theta_step: the step of the grid in the theta direction
        :param phi_step: the step of the grid in the phi direction
        :param time: the maximal value of the time parameter
        :param time_step: the step of the grid in the time direction
        :param coord: the coordinates stored in the texture
        :return: the 3D texture encoding the given coordinate
        """
        n_theta = int(2 * pi / theta_step)
        n_phi = int(pi / phi_step)
        n_time = int(time / time_step)

        shape = [n_theta, n_phi, n_time]
        res = sitk.Image(shape, sitk.sitkFloat32)
        for i in range(n_theta):
            for j in range(n_phi):
                theta = 2 * pi * i / n_theta
                phi = pi * j / n_phi
                p = self.start(theta, phi)
                for k in range(n_time):
                    res[i, j, k] = p[coord]
                    t = k * time_step
                    p = self._step(t, p, time_step)

        return res

    @timer
    def export_texture_3d(self, filename: str, theta_step: float, phi_step: float, time: float, time_step: float):
        """
        Return an 3D numpy array index by theta,phi,time
        :param filename: name of the file without extension
        :param theta_step: the step of the grid in the theta direction
        :param phi_step: the step of the grid in the phi direction
        :param time: the maximal value of the time parameter
        :param time_step: the step of the grid in the time direction
        :return: the grid
        """
        writer = sitk.ImageFileWriter()
        coord_name = ['x', 'y', 'z']
        for coord in range(3):
            image = self.texture_3d(theta_step, phi_step, time, time_step, coord)
            writer.SetFileName(filename + '_' + coord_name[coord] + '.nrrd')
            writer.Execute(image)


class PulledBackFlow(Solver):
    """
    Studying the pull back to the origin of the tangent vector along a geodesic in Nil

    The coordinates (x,y,z,ux,uy,uy) of a position represents
    - the coordinates (x,y,z) of the point at time t on the geodesic
    - the coordinates (ux,uy,uz) of the pull back at the origin of the tangent vector at time t

    The actual tangent vector at (x,y,z) is given by
    (e^z ux , e^{-z}uy, uz)
    """

    def __init__(self, verbose: bool = False) -> None:
        """
        Constructor
        """
        Solver.__init__(self, 3, verbose=verbose)
        self.set_params(method='RK2')

    def _normalization(self, t, p: ndarray) -> ndarray:
        """
        Normalization
        Make sure the the tangent vector has always norm 1 (for the Sol metric)
        :param t: the current time
        :param p: the current position p = (x,y,z,dx,dy,dz)
        :return: the normalized position
        """

        x, y, z, ux, uy, uz = p
        length = sqrt(ux ** 2 + uy ** 2 + uz ** 2)
        return array([x, y, z, ux / length, uy / length, uz / length])

    @staticmethod
    def car2sph(x: float, y: float, z: float) -> Tuple[float, float, float]:
        """
        Conversion from cartesian coordinates to spherical coordinates
        """
        return sqrt(x ** 2 + y ** 2 + z ** 2), arctan2(y, x), arctan2(sqrt(x ** 2 + y ** 2), z)

    @staticmethod
    def sph2car(r: float, theta: float, phi: float) -> Tuple[float, float, float]:
        """
        Conversion from spherical coordinates to cartesian coordinates
        """
        return r * sin(phi) * cos(theta), r * sin(phi) * sin(theta), r * cos(phi)

    """
    Let P_r be the plane in R^3 of all points (x,y,z) such that x + y + z = r
    We now describe a few maps to project the positive quadrant of the sphere onto P_1
    We choose for a basis of P_0 (the underlying linear space of the affine space P_1) the vector 
    - u1 = (-1, 1, 0)
    - u2  = (-1/2, -1/2, 1)
    The origin will be a the point Q = (1, 0, 0)
    The image of the positive quadrant is entirely contained in the rectangle described by the points of the form 
    M = Q + s1 * u1 + s2 * u2
    where  s1, s2 in [0,1]
    In practice we will consider the point of the above form with s1, s2 in [- epsilon , 1+ epsilon]
    This should avoid some discontinuity due to a lack of linearization in the texture at the boundary.
    """

    @staticmethod
    def rad_proj(x: float, y: float, z: float) -> Tuple[float, float, float]:
        """
        The function map R^3 - P_0 onto P_1
        More precisely, in M is a point in R^3 - P_0, then the method return the intersection point of (OM) with P_1
        :param x: the first coordinate of the point to project
        :param y: the second coordinate of the point to project
        :param z: the third coordinate of the point to project
        :return: the projected point
        """
        s = x + y + z
        return x / s, y / s, z / s

    @staticmethod
    def inv_rad_proj(x: float, y: float, z: float) -> Tuple[float, float, float]:
        """
        Given a point M = (x,y,z) in the plane P_1 (i.e. such that x + y + z), return the point M' the sphere
        such that OM' = lambda OM with lambda > 0
        :param x: the first coordinate of the point to project
        :param y: the second coordinate of the point to project
        :param z: the third coordinate of the point to project
        :return: the projected point
        """
        n = sqrt(x ** 2 + y ** 2 + z ** 2)
        return x / n, y / n, z / n

    @staticmethod
    def p_to_local(x: float, y: float, z: float) -> Tuple[float, float]:
        """
        Given a point M = (x,y,z) in P_1 (i.e. such that x + y + z = 1)
        return the coordinate of M in the frame (Q, u1, u2), i.e. the scalar s1, s2 such that
        M = Q + s1 * u1 + s2 * u2
        :param x: the first coordinate of the point to project
        :param y: the second coordinate of the point to project
        :param z: the third coordinate of the point to project
        :return: the local coordinates
        """
        return y + 0.5 * z, z

    @staticmethod
    def p_to_global(s1: float, s2: float) -> Tuple[float, float, float]:
        """
        Given a point M in P_1 given in local coordinates, i.e. M = Q + s1 * u1 + s2 * u2,
        return its global coordinates x, y, z
        :param s1: the first local coordinate
        :param s2: the second local coordinate
        :return: the global coordinates
        """
        return 1 - s1 - 0.5 * s2, s1 - 0.5 * s2, s2

    def field(self, t: float, p: ndarray) -> ndarray:
        """
        The vector field of the geodesic flow at the point p = (x,y,z,dx,dy,dz)
        :param t: the current time
        :param p: the current position
        :return: the vector field
        """
        x, y, z, ux, uy, uz = p

        dx = exp(z) * ux
        dy = exp(-z) * uy
        dz = uz
        dux = ux * uz
        duy = -uy * uz
        duz = -ux ** 2 + uy ** 2

        return array([dx, dy, dz, dux, duy, duz])

    @staticmethod
    def start_sph(theta: float, phi: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector given by angle in spherical coordinates
        :param theta: latitude (or longitude never knwo which is one)
        :param phi: longitude (or latitude)
        :return: the initial position
        """
        return array([0., 0., 0., sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)])

    @staticmethod
    def start_local(s1: float, s2: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector
        given by the local coordinates of its projection in P_1
        :param s1: the first local coordinate
        :param s2: the second local coordinate
        :return: the initial position
        """
        px, py, pz = PulledBackFlow.p_to_global(s1, s2)
        ux, uy, uz = PulledBackFlow.inv_rad_proj(px, py, pz)
        return array([0., 0., 0., ux, uy, uz])

    @timer
    def export_texture_3d(self, filename: str, theta_step: float, phi_step: float, time: float, time_step: float,
                          time_skip: int):
        """
        Return 3D images index by theta,phi,time coding the position/speed achieved by the geodesic flow
        :param filename: name of the file without extension
        :param theta_step: the step of the grid in the theta direction
        :param phi_step: the step of the grid in the phi direction
        :param time: the maximal value of the time parameter
        :param time_step: the step of the grid in the time direction
        :param time_skip: in the image file we keep only 1/skip time values (rasterization)
        :return: the lookup tables as 3D image files
        """
        # shape of the images files
        # because of the symmetries we only care of the positive quadrant (x> 0, y>0 and z>0)
        # i.e.  0 < theta < pi/2 and 0 < phi < pi/2
        n_theta = int(0.5 * pi / theta_step)
        n_phi = int(0.5 * pi / phi_step)
        n_time = int(time / time_step)
        shape = [n_theta, n_phi, n_time // time_skip]

        # creating ITK Image objects
        # TODO. Find how to generate image files with a 5D vector at each pixel
        img_x = sitk.Image(shape, sitk.sitkFloat32)
        img_y = sitk.Image(shape, sitk.sitkFloat32)
        img_z = sitk.Image(shape, sitk.sitkFloat32)
        img_theta = sitk.Image(shape, sitk.sitkFloat32)
        img_phi = sitk.Image(shape, sitk.sitkFloat32)

        for i in range(n_theta):
            for j in range(n_phi):
                theta = i * 0.5 * pi / n_theta
                phi = j * 0.5 * pi / n_phi
                p = self.start_sph(theta, phi)
                for k in range(n_time):
                    if k % time_skip == 0:
                        img_x[i, j, k // time_skip] = p[0]
                        img_y[i, j, k // time_skip] = p[1]
                        img_z[i, j, k // time_skip] = p[2]
                        _, theta, phi = self.car2sph(p[3], p[4], p[5])
                        img_theta[i, j, k // time_skip] = theta
                        img_phi[i, j, k // time_skip] = phi

                    t = k * time_step
                    p = self._step(t, p, time_step)

        writer = sitk.ImageFileWriter()

        writer.SetFileName(filename + '_x.nrrd')
        writer.Execute(img_x)
        writer.SetFileName(filename + '_y.nrrd')
        writer.Execute(img_y)
        writer.SetFileName(filename + '_z.nrrd')
        writer.Execute(img_z)
        writer.SetFileName(filename + '_theta.nrrd')
        writer.Execute(img_theta)
        writer.SetFileName(filename + '_phi.nrrd')
        writer.Execute(img_phi)

    @timer
    def export_texture_3d_log_time(self, filename: str, theta_step: float, phi_step: float, n: int, precision: float):
        """
        Return 3D images index by theta,phi,time coding the position/speed achieved by the geodesic flow
        The texture has n+1 times slices
        The time is in log_2 coordinate, i.e.
        the k-th time slice correspond to
        - t = 0, if k = 0
        - t = 1/ 2^(n + 1 - k) if  k in {1, ... , n+1}
        :param filename: name of the file without extension
        :param theta_step: the step of the grid in the theta direction
        :param phi_step: the step of the grid in the phi direction
        :param n: number (up to 2) of time slices
        :param precision: the maximal value for the time step
        :return: the lookup tables as 3D image files
        """
        # shape of the images files
        # because of the symmetries we only care of the positive quadrant (x> 0, y>0 and z>0)
        # i.e.  0 < theta < pi/2 and 0 < phi < pi/2
        n_theta = int(0.5 * pi / theta_step)
        n_phi = int(0.5 * pi / phi_step)
        shape = [n_theta, n_phi, n + 2]

        # creating ITK Image objects
        # TODO. Find how to generate image files with a 5D vector at each pixel
        img_x = sitk.Image(shape, sitk.sitkFloat32)
        img_y = sitk.Image(shape, sitk.sitkFloat32)
        img_z = sitk.Image(shape, sitk.sitkFloat32)
        img_theta = sitk.Image(shape, sitk.sitkFloat32)
        img_phi = sitk.Image(shape, sitk.sitkFloat32)

        # loop over all the (theta, phi) coordinates
        for i in range(n_theta):
            for j in range(n_phi):
                theta = i * 0.5 * pi / n_theta
                phi = j * 0.5 * pi / n_phi
                p = self.start_sph(theta, phi)

                # initial length of the time step
                time_step = 1. / 2. ** n
                # number of integration step to reach the next time recorded in the texture
                number_step = 1
                # the time parameter (not really important: this system is homogeneous, for debugging purpose)
                t = 0
                # loop over the time slice of the texture.
                for k in range(n + 2):

                    # record the achieved state in the texture
                    img_x[i, j, k] = p[0]
                    img_y[i, j, k] = p[1]
                    img_z[i, j, k] = p[2]
                    _, theta, phi = self.car2sph(p[3], p[4], p[5])
                    img_theta[i, j, k] = theta
                    img_phi[i, j, k] = phi
                    if self.verbose:
                        if k == 0:
                            check = 0
                        else:
                            check = 1. / 2. ** (n + 1 - k)
                        print('step', k, '--', t, check, time_step)

                    # flowing until the next state
                    # if k = n, there is no need to flow as we will not record the next position
                    if k != n + 1:
                        for l in range(number_step):
                            p = self._step(t, p, time_step)
                            t = t + time_step

                        # update the time step and the number of step for the next flow session
                        # we make sure that the time step is always less than the given precision
                        if k != 0:
                            if time_step < 0.5 * precision:
                                # if we double the time step, the number of steps to perform remain unchanged
                                time_step = 2 * time_step
                            else:
                                # if the time step is fixed, we need to double the number of steps
                                number_step = 2 * number_step

        writer = sitk.ImageFileWriter()

        writer.SetFileName(filename + '_x.nrrd')
        writer.Execute(img_x)
        writer.SetFileName(filename + '_y.nrrd')
        writer.Execute(img_y)
        writer.SetFileName(filename + '_z.nrrd')
        writer.Execute(img_z)
        writer.SetFileName(filename + '_theta.nrrd')
        writer.Execute(img_theta)
        writer.SetFileName(filename + '_phi.nrrd')
        writer.Execute(img_phi)

    @timer
    def export_another_texture(self, filename: str, s1_step: float, s2_step: float, margin1: float, margin2: float,
                               n: int, precision: float):
        """
        Return 3D images index by theta,phi,time coding the position/speed achieved by the geodesic flow
        The texture has n+1 times slices
        The time is in log_2 coordinate, i.e.
        the k-th time slice correspond to
        - t = 0, if k = 0
        - t = 1/ 2^(n + 1 - k) if  k in {1, ... , n+1}
        :param filename: name of the file without extension
        :param s1_step: the step of the grid in the u1 direction
        :param s2_step: the step of the grid in the u2 direction
        :param margin1: the margin when rendering the grid : s1 is in  [-margin1, 1 + margin1]
        :param margin2: the margin when rendering the grid : s2 is in  [-margin2, 1 + margin2]
        :param n: number (up to 2) of time slices
        :param precision: the maximal value for the time step
        :return: the lookup tables as 3D image files
        """
        # shape of the images files
        # because of the symmetries we only care of the positive quadrant (x> 0, y>0 and z>0)
        # i.e.  0 < theta < pi/2 and 0 < phi < pi/2
        n_s1 = int((1 + 2 * margin1) / s1_step)
        n_s2 = int((1 + 2 * margin2) / s2_step)
        shape = [n_s1, n_s2, n + 2]

        # creating ITK Image objects
        # TODO. Find how to generate image files with a 5D vector at each pixel
        img_x = sitk.Image(shape, sitk.sitkFloat32)
        img_y = sitk.Image(shape, sitk.sitkFloat32)
        img_z = sitk.Image(shape, sitk.sitkFloat32)
        img_ux = sitk.Image(shape, sitk.sitkFloat32)
        img_uy = sitk.Image(shape, sitk.sitkFloat32)
        img_uz = sitk.Image(shape, sitk.sitkFloat32)

        # loop over all the (theta, phi) coordinates
        for i in range(n_s1):
            for j in range(n_s2):
                s1 = - margin1 + i * s1_step
                s2 = - margin2 + j * s2_step
                p = self.start_local(s1, s2)

                # initial length of the time step
                time_step = 1. / 2. ** n
                # number of integration step to reach the next time recorded in the texture
                number_step = 1
                # the time parameter (not really important: this system is homogeneous, for debugging purpose)
                t = 0
                # loop over the time slice of the texture.
                for k in range(n + 2):

                    # record the achieved state in the texture
                    img_x[i, j, k] = p[0]
                    img_y[i, j, k] = p[1]
                    img_z[i, j, k] = p[2]
                    img_ux[i, j, k] = p[3]
                    img_uy[i, j, k] = p[4]
                    img_uz[i, j, k] = p[5]
                    if self.verbose:
                        if k == 0:
                            check = 0
                        else:
                            check = 1. / 2. ** (n + 1 - k)
                        print('step', k, '--', t, check, time_step)

                    # flowing until the next state
                    # if k = n, there is no need to flow as we will not record the next position
                    if k != n + 1:
                        for l in range(number_step):
                            p = self._step(t, p, time_step)
                            t = t + time_step

                        # update the time step and the number of step for the next flow session
                        # we make sure that the time step is always less than the given precision
                        if k != 0:
                            if time_step < 0.5 * precision:
                                # if we double the time step, the number of steps to perform remain unchanged
                                time_step = 2 * time_step
                            else:
                                # if the time step is fixed, we need to double the number of steps
                                number_step = 2 * number_step

        writer = sitk.ImageFileWriter()

        writer.SetFileName(filename + '_x.nrrd')
        writer.Execute(img_x)
        writer.SetFileName(filename + '_y.nrrd')
        writer.Execute(img_y)
        writer.SetFileName(filename + '_z.nrrd')
        writer.Execute(img_z)
        writer.SetFileName(filename + '_ux.nrrd')
        writer.Execute(img_ux)
        writer.SetFileName(filename + '_uy.nrrd')
        writer.Execute(img_uy)
        writer.SetFileName(filename + '_uz.nrrd')
        writer.Execute(img_uz)


class Euclidean:

    def __init__(self, verbose: bool = False) -> None:
        """
        Constructor
        """
        self.verbose = verbose

    @timer
    def export_texture_3d(self, filename: str, theta_step: float, phi_step: float, time: float, time_step: float,
                          time_skip: int):
        """
        Return 3D images index by theta,phi,time coding the position/speed achieved by the geodesic flow
        :param filename: name of the file without extension
        :param theta_step: the step of the grid in the theta direction
        :param phi_step: the step of the grid in the phi direction
        :param time: the maximal value of the time parameter
        :param time_step: the step of the grid in the time direction
        :param time_skip: in the image file we keep only 1/skip time values (rasterization)
        :return: the lookup tables as 3D image files
        """
        # shape of the images files
        n_theta = int(2 * pi / theta_step)
        n_phi = int(pi / phi_step)
        n_time = int(time / time_step)
        shape = [n_theta, n_phi, n_time // time_skip]

        # creating ITK Image objects
        # TODO. Find how to generate image files with a 5D vector at each pixel
        img_x = sitk.Image(shape, sitk.sitkFloat32)
        img_y = sitk.Image(shape, sitk.sitkFloat32)
        img_z = sitk.Image(shape, sitk.sitkFloat32)
        img_theta = sitk.Image(shape, sitk.sitkFloat32)
        img_phi = sitk.Image(shape, sitk.sitkFloat32)

        for i in range(n_theta):
            for j in range(n_phi):
                theta = -pi + 2 * pi * i / n_theta
                phi = pi * j / n_phi
                x, y, z = sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)
                for k in range(n_time):
                    t = k * time_step
                    if k % time_skip == 0:
                        img_x[i, j, k // time_skip] = t * x
                        img_y[i, j, k // time_skip] = t * y
                        img_z[i, j, k // time_skip] = t * z
                        img_theta[i, j, k // time_skip] = theta
                        img_phi[i, j, k // time_skip] = phi

        writer = sitk.ImageFileWriter()

        writer.SetFileName(filename + '_x.nrrd')
        writer.Execute(img_x)
        writer.SetFileName(filename + '_y.nrrd')
        writer.Execute(img_y)
        writer.SetFileName(filename + '_z.nrrd')
        writer.Execute(img_z)
        writer.SetFileName(filename + '_theta.nrrd')
        writer.Execute(img_theta)
        writer.SetFileName(filename + '_phi.nrrd')
        writer.Execute(img_phi)
