from .sol import PulledBackFlow, Euclidean


def run():
    flow = PulledBackFlow(verbose=False)
    # flow.export_texture_3d('texsym', 0.0025, 0.005, 1., 0.01, 10)
    # flow.export_texture_3d_log_time('testbis', 0.01, 0.01, 15, 0.01)
    # flow.export_texture_3d('testhgp', 0.01, 0.01, 1., 0.001, 10)
    flow.export_another_texture('another', 0.001, 0.001, 0.002, 0.002, 15, 0.01)


def run_euc():
    flow = Euclidean(verbose=True)
    flow.export_texture_3d('euc', 0.01, 0.01, 1., 0.01, 10)

