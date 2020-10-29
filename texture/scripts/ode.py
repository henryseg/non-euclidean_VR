from abc import ABC, abstractmethod
from typing import NoReturn, List, Tuple

from numpy import ndarray, array, concatenate

from .toolbox import timer


class Solver(ABC):
    """
    Abstract class for numerically solving ODE
    Could be some day replaced by scipy.integrate.ode (if I have the courage to read the doc)
    https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.ode.html
    """

    def __init__(self, dim: int, verbose: bool = False) -> None:
        """
        Constructor
        :param dim: the dimension of the problem (basically the number of variables)
        :param verbose: verbose mode ON or OFF
        """
        self.dim = dim
        self.verbose = verbose

        # variable to be defined by the `set_params` method
        self.method = None

    def set_params(self, **kwargs) -> NoReturn:
        """
        Set the parameters.
        The key of the dictionary are used as the name of the properties
        :param kwargs:
        """
        for key, val in kwargs.items():
            setattr(self, key, val)

    @abstractmethod
    def field(self, t: float, p: ndarray) -> ndarray:
        """
        Compute the vector field to integrate at the time `t` and the point `p`
        :param t: the time
        :param p: the point
        :return: the vector field
        """
        raise NotImplementedError("This method should be implemented")

    def _normalization(self, t, p: ndarray) -> ndarray:
        """
        Normalize the given position
        e.g. if the trajectory is known to be on a sphere,
        this method can be overwritten to normalize the point at each step
        By default, the method does nothing
        :param t: the current time
        :param p: the current position
        :return: the projected position
        """
        return p

    def _step(self, t: float, p: ndarray, step: float) -> ndarray:
        """
        Given the position p at time t, compute the position at time t+step using prescribed method
        :param t: the current time
        :param p: the current position
        :param step: the time step
        :return: the new position (at time t + step)
        """
        if self.method is None:
            raise ValueError('The resolution method has not be defined')

        if self.method == 'EULER':
            new = self._euler_step(t, p, step)
        elif self.method == 'RK2':
            new = self._rk2_step(t, p, step)
        else:
            raise NotImplementedError("This resolution method is not implemented yet")

        return self._normalization(t + step, new)

    def _euler_step(self, t: float, p: ndarray, step: float) -> ndarray:
        """
        Given the position p at time t, compute the position at time t+step using Euler method
        :param t: the current time
        :param p: the current position
        :param step: the time step
        :return: the new position (at time t + step)
        """
        res = p + step * self.field(t, p)
        return res

    def _rk2_step(self, t: float, p: ndarray, step: float) -> ndarray:
        """
        Given the position p at time t, compute the position at time t+step the Runge-Kutta method or order 2
        :param t: the current time
        :param p: the current position
        :param step: the time step
        :return: the new position (at time t + step)
        """
        t_aux = t + step / 2
        p_aux = p + (step / 2) * self.field(t, p)
        res = p + step * self.field(t_aux, p_aux)
        return res

    @timer
    def trajectory(self, t0: float, p0: ndarray, t1: float, step: float) -> List[Tuple[float, ndarray]]:
        """
        Return a list of positions, corresponding to the trajectory using the prescribed method
        :param t0: the initial time
        :param p0: the initial position
        :param t1: the final time
        :param step: the time increment
        :return: the trajectory as a list pairs (time, position)
        """
        if t1 < t0:
            raise ValueError("The time `t1` should be larger than the initial time `t2`")

        n = int((t1 - t0) / step)
        t = t0
        p = p0.copy()

        res = list()
        for i in range(n):
            res.append((t, p))
            if self.verbose:
                print(t, p)
            p = self._step(t, p, step)
            t = t + step

        return res

    @timer
    def solve(self, t0: float, p0: ndarray, t1: float, step: float) -> ndarray:
        """
        Return the solution at time t1 using the prescribed method
        :param t0: the initial time
        :param p0: the initial position
        :param t1: the time at which the solution should be computed
        :param step: the time increment
        :return: the solution
        """
        if t1 < t0:
            raise ValueError("The time `t1` should be larger than the initial time `t2`")

        n = int((t1 - t0) / step)
        t = t0
        p = p0.copy()

        for i in range(n):
            p = self._step(t, p, step)
            t = t + step

        return p

    @staticmethod
    def traj_to_array(traj: List[Tuple[float, ndarray]]) -> List[ndarray]:
        """
        Take a trajectory where each step is a pair (time, pos)
        Return the same trajectory where each step it an array a with
        - a[0] : time
        - a[1: len(a)] : pos
        :param traj: the input trajectory
        :return: the formatted trajectory
        """
        res = list()
        for t, p in traj:
            new = concatenate((
                array([t]),
                p
            ))
            res.append(new)

        return res
