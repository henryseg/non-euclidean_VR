"""
Numeric integration of the geodesic flow
"""
from typing import Tuple, NoReturn, List

from numpy import ndarray, array, zeros, exp, sqrt, sin, cos, pi, abs
from numpy.linalg import norm
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
        norm = sqrt(exp(-2 * z) * dx ** 2 + exp(2 * z) * dy ** 2 + dz ** 2)
        return array([x, y, z, dx / norm, dy / norm, dz / norm])

    def start(self, theta: float, phi: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector given by angle in spherical coordinates
        :param theta: latitude (or longitude never know which is one)
        :param phi: longitude (or latitude)
        :return: the initial position
        """
        return array([0, 0, 0, sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)])

    def flow(self, theta: float, phi: float, t: float, step: float) -> List[Tuple[float, ndarray]]:
        """
        Return the trajectory of the geodesic flow from the origin,
        where the initial tangent vector is given in spherical coordinate
        :param theta: latitude (or longitude never know which is one)
        :param phi: longitude (or latitude)
        :param t: the time to flow
        :param step: the length of the steps
        :return: the trajectory
        """
        p0 = self.start(theta, phi)
        return self.trajectory(0, p0, t, step)

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
    """

    def __init__(self, verbose: bool = False) -> None:
        """
        Constructor
        """
        Solver.__init__(self, 3, verbose=verbose)
        self.set_params(method='RK2')

    def field(self, t: float, p: ndarray) -> ndarray:
        """
        The vector field of the geodesic flow at the point p = (x,y,z,dx,dy,dz)
        :param t: the current time
        :param p: the current position
        :return: the vector field
        """
        x, y, z = p

        dx = x * z
        dy = -y * z
        dz = -x ** 2 + y ** 2

        return array([dx, dy, dz])

    def _normalization(self, t, p: ndarray) -> ndarray:
        """
        Normalization
        Make sure the the tangent vector has always norm 1 (for the Sol metric)
        :param t: the current time
        :param p: the current position p = (x,y,z,dx,dy,dz)
        :return: the normalized position
        """
        return p / norm(p)

    def start(self, theta: float, phi: float) -> ndarray:
        """
        Define the starting point as the origin with the tangent vector given by angle in spherical coordinates
        :param theta: latitude (or longitude never knwo which is one)
        :param phi: longitude (or latitude)
        :return: the initial position
        """
        return array([sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi)])

    def flow(self, theta: float, phi: float, t: float, step: float) -> List[Tuple[float, ndarray]]:
        """
        Return the trajectory of the geodesic flow from the origin,
        where the initial tangent vector is given in spherical coordinate
        :param theta: latitude (or longitude never knwo which is one)
        :param phi: longitude (or latitude)
        :param t: the time to flow
        :param step: the length of the steps
        :return: the trajectory
        """
        p0 = self.start(theta, phi)
        return self.trajectory(0, p0, t, step)
