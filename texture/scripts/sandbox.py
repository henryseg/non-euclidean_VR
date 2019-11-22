from .sol import PulledBackFlow


def run():
    flow = PulledBackFlow(verbose=True)
    flow.export_texture_3d('test1', 0.01, 0.01, 1., 0.01, 10)
