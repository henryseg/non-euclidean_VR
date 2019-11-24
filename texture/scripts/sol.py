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
    def start(theta: float, phi: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector given by angle in spherical coordinates
        :param theta: latitude (or longitude never knwo which is one)
        :param phi: longitude (or latitude)
        :return: the initial position
        """
        return array([0., 0., 0., sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)])

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
                p = self.start(theta, phi)
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
