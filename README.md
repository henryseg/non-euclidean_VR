# Ray-marching in Thurston geometries

This project started from the ray marching hyperbolic virtual reality [simulation](https://github.com/mtwoodard/hypVR-Ray_m) (for mobile devices) by Henry Segerman and Michael Woodard,
which is in turn based on the full [simulation](https://github.com/mtwoodard/hypVR-Ray).

This version is as independent of the underlying geometry as possible.
It comes with an API to
- build scene in a given geometry
- define objects, lights, materials, etc
- implement new geometries (or new models of existing geometries)

This project started at the Illustrating Mathematics semester program at [ICERM](https://icerm.brown.edu). 

## Controls

The default controls in the example pages are the following.

Command | QWERTY keyboard | AZERTY keyboard
--- | --- | ---
Yaw left|`a`|`q`
Yaw right|`d`|`d`
Pitch up|`w`|`z`
Pitch down|`s`|`s`
Roll left|`q`|`a`
Roll right|`e`|`e`
Move forward|`arrow up`|`arrow up`
Move backward|`arrow down`|`arrow down`
Move to the left|`arrow left`|`arrow left`
Move the the right|`arrow right`|`arrow right`
Move upwards|`'`|`ù`
Move downwards|`/`|`=`

## Running Locally
Running this locally requires a simple web server (to allow CORS requests).
This can be done in Python 3 by running the command 

```(zsh)
python -m http.server
```

To run the VR examples you may need a more advance settings as an HTTPS protocole is required.

On Windows, you can set up a server in the Control Panel Administrative Tools, in the IIS Manager (you may need to turn this feature on first). 

**Note**: The server will need to have a MIME type configuration:
- `.glsl` files -> `text/plain` (probably no more needed).
- `.mjs` files -> `text/javascript` 

## Done or in progress
S^3, E^3, H^3, Nil

## License

Released under the terms of the GNU [General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html), version 3 or later.


## Main contributors

(alphabetic order)

- **Rémi Coulon** [@remi-coulon](https://github.com/remi-coulon)
  
  Rémi Coulon is partially supported by the the *Centre Henri Lebesgue* ANR-11-LABX-0020-01 
  and the Agence Nationale de la Recherche under Grant *Dagger* ANR-16-CE40- 0006-01
- **Sabetta Matsumoto** [@sabetta](https://github.com/sabetta)
- **Henry Segerman** [@henryseg](https://github.com/henryseg)
  
  Henry Segerman is partially supported by NSF grant DMS-1708239.
  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.
- **Steve Trettel** [@stevejtrettel](https://github.com/stevejtrettel)