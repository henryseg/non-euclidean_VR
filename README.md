# Ray-marching in Thurston geometries

This project started from the ray marching hyperbolic virtual reality [simulation](https://github.com/mtwoodard/hypVR-Ray_m) (for mobile devices) by Henry Segerman and Michael Woodard,
which is in turn based on the full [simulation](https://github.com/mtwoodard/hypVR-Ray).

This version is as independent of the underlying geometry as possible.
It comes with an API to
- build and animate scenes in a given geometry
- define objects, lights, materials, etc
- implement new geometries (or new models of existing geometries)

This project started at the *Illustrating Mathematics* semester program at [ICERM](https://icerm.brown.edu).

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

## Install and run
This version requires [npm](https://www.npmjs.com/) and [parcel](https://parceljs.org/).
You must firt install these tools following the instructions for your operating system.
(On Mac one can use [homebrew](https://brew.sh/) to install npm, and then install parcel with npm.)
### Installation

- clone the git repository of `non-euclidean-vr`
- install the dependencies with the command
  ```(zsh)
  npm install
  ```

### Run
  
Now you can use parcel to emulate a local server by running the command

```(zsh)
parcel index.html
```

## Examples

A list of examples can be found in the directory `examples`
It contains scenes in the various geometries and demonstrates the features of the API.

The examples tagged with *VR* are made for virtual reality. They should work with any VR headset supported by the three.js library.
When loaded, those examples have a button *Enter VR* at the bottom on the screen.
Clicking this button should launch the simulation in the VR headset (you may first need to allow your browser to interact with the VR system).

Items flagged with *PR* incorporate a path tracer. Hit `p` to launch the path tracer.
## License

Released under the terms of the GNU [General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html), version 3 or later.


## Main contributors

(alphabetical order)

- **Rémi Coulon** [@remi-coulon](https://github.com/remi-coulon)

  Rémi Coulon is partially supported by the the *Centre Henri Lebesgue* ANR-11-LABX-0020-01
  and the Agence Nationale de la Recherche under Grant *Dagger* ANR-16-CE40- 0006-01.
- **Sabetta Matsumoto** [@sabetta](https://github.com/sabetta)

  Sabetta Matsumoto is partially supported by NSF grant DMR-1847172 and the Research Corporation for Scientific Advancement.

- **Henry Segerman** [@henryseg](https://github.com/henryseg)

  Henry Segerman is partially supported by NSF grant DMS-1708239.

- **Steve Trettel** [@stevejtrettel](https://github.com/stevejtrettel)

Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.
