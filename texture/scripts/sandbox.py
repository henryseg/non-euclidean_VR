from sol import Flow

flow = Flow(verbose=True);
flow.export_texture_3d('test', 0.1, 0.1, 3., 0.1)
