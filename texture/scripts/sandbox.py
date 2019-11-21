from .sol import Flow

flow = Flow(verbose=True);
flow.export_texture_3d('dist1', 0.01, 0.01, 1., 0.001)
