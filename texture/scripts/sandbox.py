from .sol import PulledBackFlow, Euclidean


def run():
    flow = PulledBackFlow(verbose=True)
    flow.export_texture_3d('test2', 0.01, 0.01, 1., 0.01, 10)

def run_euc():
    flow = Euclidean(verbose=True)
    flow.export_texture_3d('euc', 0.01, 0.01, 1., 0.01, 10)
