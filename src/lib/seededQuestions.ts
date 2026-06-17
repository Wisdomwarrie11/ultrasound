import { Question } from '../types';

export const ULTRA_PHYSICS_50_QUESTIONS: Question[] = [
  {
    id: 'up-q1',
    testId: 'test-physics-50',
    questionText: 'What is the average propagation speed of sound waves in human soft tissue?',
    options: ['343 m/s', '1450 m/s', '1540 m/s', '3500 m/s'],
    correctAnswer: 2,
    explanation: 'The average propagation speed of sound in human soft tissue is universally defined as 1540 m/s (or 1.54 mm/µs).'
  },
  {
    id: 'up-q2',
    testId: 'test-physics-50',
    questionText: 'Which tissue type has the lowest propagation speed of sound?',
    options: ['Fat', 'Muscle', 'Bone', 'Air / Lungs'],
    correctAnswer: 3,
    explanation: 'Air and lung tissues have the lowest propagation speed of sound (approx. 330 m/s - 500 m/s) because of their low density and high compressibility.'
  },
  {
    id: 'up-q3',
    testId: 'test-physics-50',
    questionText: 'Which tissue type has the highest propagation speed of sound?',
    options: ['Fat', 'Muscle', 'Bone', 'Soft Tissue'],
    correctAnswer: 2,
    explanation: 'Bone has a very high stiffness, which results in a high propagation speed of sound (approx. 3500 m/s - 4080 m/s).'
  },
  {
    id: 'up-q4',
    testId: 'test-physics-50',
    questionText: 'What is the relationship between frequency and period of an ultrasound wave?',
    options: ['They are directly proportional', 'They are reciprocals (inversely proportional)', 'They are unequal but unrelated', 'They are squared multiples'],
    correctAnswer: 1,
    explanation: 'Frequency (f) and Period (T) are reciprocals (f = 1/T). As frequency increases, period decreases.'
  },
  {
    id: 'up-q5',
    testId: 'test-physics-50',
    questionText: 'What is the frequency range commonly used in clinical diagnostic ultrasound imaging?',
    options: ['Less than 20 Hz', '20 Hz to 20,000 Hz', '10,000 Hz to 100,500 Hz', '2 MHz to 15 MHz'],
    correctAnswer: 3,
    explanation: 'Diagnostic medical ultrasound typically utilizes high frequencies from 2 MHz to 15 MHz (and sometimes up to 20+ MHz for superficial imaging).'
  },
  {
    id: 'up-q6',
    testId: 'test-physics-50',
    questionText: 'How is the wavelength of sound in a medium calculated?',
    options: [
      'Wavelength = Propagation Speed / Frequency',
      'Wavelength = Propagation Speed * Frequency',
      'Wavelength = Density * Propagation Speed',
      'Wavelength = Amplitude / Frequency'
    ],
    correctAnswer: 0,
    explanation: 'Wavelength (λ) is computed by dividing the propagation speed (c) of sound in the medium by its frequency (f): λ = c/f.'
  },
  {
    id: 'up-q7',
    testId: 'test-physics-50',
    questionText: 'As ultrasound moves from fat tissue (c ≈ 1450 m/s) into muscle tissue (c ≈ 1580 m/s), what happens to its wavelength?',
    options: ['It remains identical', 'It increases', 'It decreases', 'It drops to zero'],
    correctAnswer: 1,
    explanation: 'Frequency remains constant when sound crosses a boundary. Since wavelength = c/f, an increase in propagation speed (c) results in an increased wavelength.'
  },
  {
    id: 'up-q8',
    testId: 'test-physics-50',
    questionText: 'Which parameter describes the percentage of time that the ultrasound system is actively transmitting a sound pulse?',
    options: ['Pulse Duration', 'Pulse Repetition Period', 'Duty Factor', 'Spatial Pulse Length'],
    correctAnswer: 2,
    explanation: 'The Duty Factor is the percentage of time the system is active. For pulsed wave diagnostic imaging, it is typically very small (<1%).'
  },
  {
    id: 'up-q9',
    testId: 'test-physics-50',
    questionText: 'What determines the Spatial Pulse Length (SPL)?',
    options: [
      'The source only',
      'The medium only',
      'Both the source (wavelength) and the number of cycles in the pulse',
      'The depth selection on the dashboard console'
    ],
    correctAnswer: 2,
    explanation: 'Spatial Pulse Length (SPL) is the length of space over which a pulse occurs. SPL = Wavelength * Number of Cycles in the pulse.'
  },
  {
    id: 'up-q10',
    testId: 'test-physics-50',
    questionText: 'Which index is most relevant in determining the likelihood of cavitation and mechanical bioeffects?',
    options: ['Thermal Index (TI)', 'Mechanical Index (MI)', 'Time-Gain Compensation (TGC)', 'Snell’s Index'],
    correctAnswer: 1,
    explanation: 'The Mechanical Index (MI) is related to non-thermal bioeffects, such as cavitation, and is computed from the peak rarefactional pressure and frequency.'
  },
  {
    id: 'up-q11',
    testId: 'test-physics-50',
    questionText: 'How does the introduction of backing/damping material affect a transducer’s pulse?',
    options: [
      'Increases Spatial Pulse Length and increases resolution',
      'Reduces the number of cycles per pulse, shortens SPL, and improves axial resolution',
      'Increases sensitivity and narrows active frequencies',
      'Abolishes physical matching layer boundaries'
    ],
    correctAnswer: 1,
    explanation: 'Damping material dampens the crystal crystal vibrations, resulting in shorter pulse duration and shorter SPL. This enhances axial resolution but reduces sensitivity.'
  },
  {
    id: 'up-q12',
    testId: 'test-physics-50',
    questionText: 'What is the optimal thickness of the transducer matching layer?',
    options: ['1 wavelength thick', '1/2 wavelength thick', '1/4 wavelength thick', '1/8 wavelength thick'],
    correctAnswer: 2,
    explanation: 'The matching layer is designed to be equal to 1/4 the wavelength of sound in the matching layer material to maximize constructive transmission.'
  },
  {
    id: 'up-q13',
    testId: 'test-physics-50',
    questionText: 'What is the optimal thickness of the transducer active piezoelectric element?',
    options: ['1 wavelength thick', '1/2 wavelength thick', '1/4 wavelength thick', '1/10 wavelength thick'],
    correctAnswer: 1,
    explanation: 'The active element (PZT crystal) is designed to be 1/2 the wavelength of sound in the crystal material.'
  },
  {
    id: 'up-q14',
    testId: 'test-physics-50',
    questionText: 'Which term refers to the reduction in amplitude, power, and intensity of a sound wave as it travels through a medium?',
    options: ['Acoustic Impedance', 'Attenuation', 'Refraction', 'Demodulation'],
    correctAnswer: 1,
    explanation: 'Attenuation is the drop in sound wave intensity as it penetrates tissue, caused by three mechanisms: absorption, reflection, and scattering.'
  },
  {
    id: 'up-q15',
    testId: 'test-physics-50',
    questionText: 'What is the approximate attenuation coefficient of ultrasound in soft tissue?',
    options: ['0.5 dB/cm per MHz', '1.5 dB/cm per MHz', '3.0 dB/cm per MHz', '10 dB/cm per MHz'],
    correctAnswer: 0,
    explanation: 'In clinical calculations, the average attenuation coefficient in human soft tissue is estimated to be 0.5 dB/cm per MHz.'
  },
  {
    id: 'up-q16',
    testId: 'test-physics-50',
    questionText: 'What is the half-value layer (HVL) thickness in diagnostic ultrasound?',
    options: [
      'The thickness of tissue where propagation speed doubles',
      'The depth at which the initial sound beam intensity is reduced by 50% (-3 dB)',
      'The thickness of the matching crystal element',
      'The maximum focal depth setting'
    ],
    correctAnswer: 1,
    explanation: 'The half-value layer thickness (or depth) is the distance sound travels in a tissue that reduces the intensity of sound of 3 dB, which corresponds to exactly 50%.'
  },
  {
    id: 'up-q17',
    testId: 'test-physics-50',
    questionText: 'Acoustic impedance is calculated as the product of which two parameters?',
    options: [
      'Frequency and Wavelength',
      'Tissue Density and Propagation Speed',
      'Power and Beam Cross-Section Area',
      'Damping Factor and Wavelength'
    ],
    correctAnswer: 1,
    explanation: 'Acoustic impedance (Z), measured in Rayls, is equal to the density (ρ) of the medium multiplied by the propagation speed (c): Z = ρ * c.'
  },
  {
    id: 'up-q18',
    testId: 'test-physics-50',
    questionText: 'Under what condition does ultrasound reflection occur at a tissue boundary?',
    options: [
      'When the tissue densities are exactly identical',
      'When there is a mismatch in acoustic impedance between the two media',
      'Only if the incident angle is greater than 90 degrees',
      'When sound propagation speeds are perfectly equalized'
    ],
    correctAnswer: 1,
    explanation: 'Reflection relies on a difference or mismatch in acoustic impedance (Z) at the boundary. No impedance mismatch results in no reflection (100% transmission).'
  },
  {
    id: 'up-q19',
    testId: 'test-physics-50',
    questionText: 'Snell’s Law governs which acoustic physical phenomenon?',
    options: ['Specular Reflection', 'Acoustic Scattering', 'Refraction (sound beam bending)', 'Shadowing Divergence'],
    correctAnswer: 2,
    explanation: 'Snell’s Law describes refraction, which is the bending of sound across a boundary, requiring oblique incidence and different propagation speeds on either side.'
  },
  {
    id: 'up-q20',
    testId: 'test-physics-50',
    questionText: 'Which formula represents the calculation for Axial Resolution?',
    options: [
      'Axial Resolution = Spatial Pulse Length / 2',
      'Axial Resolution = Beam Width',
      'Axial Resolution = wavelength / 4',
      'Axial Resolution = Frequency * 2'
    ],
    correctAnswer: 0,
    explanation: 'Axial resolution is the minimum distance two structures parallel to the beam must be to resolve them. It is equal to one-half the spatial pulse length (SPL / 2).'
  },
  {
    id: 'up-q21',
    testId: 'test-physics-50',
    questionText: 'What determines the Lateral Resolution of an ultrasound system?',
    options: ['The active pulse duration', 'The width of the sound beam', 'The damping material thickness', 'The contrast screen settings'],
    correctAnswer: 1,
    explanation: 'Lateral resolution is the ability to distinguish structures perpendicular to the scan line. It is determined solely by beam width (narrower beam = better lateral resolution).'
  },
  {
    id: 'up-q22',
    testId: 'test-physics-50',
    questionText: 'At which location along a focused sound beam is lateral resolution at its absolute best?',
    options: ['At the transducer face', 'At the focal point', 'Deep in the far field', 'Perfectly parallel to axial limits'],
    correctAnswer: 1,
    explanation: 'Beam width is narrowest at the focal point (focus), meaning lateral resolution is at its maximum at that depth.'
  },
  {
    id: 'up-q23',
    testId: 'test-physics-50',
    questionText: 'By raising the frequency of an ultrasound transducer, what is the impact on axial resolution and penetration?',
    options: [
      'Improves axial resolution but decreases depth of penetration',
      'Worsens axial resolution but increases depth of penetration',
      'Improves both resolution and penetration',
      'Worsens both resolution and penetration'
    ],
    correctAnswer: 0,
    explanation: 'Higher frequency produces shorter wavelengths, which decreases SPL and improves axial resolution. However, higher frequency undergoes more attenuation, decreasing depth of penetration.'
  },
  {
    id: 'up-q24',
    testId: 'test-physics-50',
    questionText: 'What is the Pulse Repetition Frequency (PRF)?',
    options: [
      'The number of cycles within a single sound pulse',
      'The number of pulses transmitted into the body per second',
      'The frequency of the backing voltage crystal',
      'The speed of blood particles'
    ],
    correctAnswer: 1,
    explanation: 'The Pulse Repetition Frequency (PRF) is the frequency of pulses transmitted by the pulser, measured in pulses per second (Hz or kHz).'
  },
  {
    id: 'up-q25',
    testId: 'test-physics-50',
    questionText: 'How are PRF and the selected maximum imaging depth related?',
    options: ['They are directly proportional', 'They are inversely proportional', 'They are unrelated', 'One is the square of the other'],
    correctAnswer: 1,
    explanation: 'PRF is inversely proportional to depth. As imaging depth increases, the system must wait longer for echoes to return, reducing the PRF (pulses sent per second).'
  },
  {
    id: 'up-q26',
    testId: 'test-physics-50',
    questionText: 'What image shape is generated by a linear sequential array transducer?',
    options: ['Sector/Pie-slice', 'Rectangular', 'Blunted Sector', 'Circular / Ring'],
    correctAnswer: 1,
    explanation: 'Linear sequential array transducers fire crystals in parallel lines, creating a rectangular image format equal to the transducer width.'
  },
  {
    id: 'up-q27',
    testId: 'test-physics-50',
    questionText: 'What image shape is generated by a phased array transducer?',
    options: ['Rectangular', 'Sector / Pie-slice', 'Flat-top trapezoid', 'True circle'],
    correctAnswer: 1,
    explanation: 'A phased array transducer steers pulses electronically at different angles, creating a sector-shaped (pie-sliced) image originating from a very small footprint.'
  },
  {
    id: 'up-q28',
    testId: 'test-physics-50',
    questionText: 'What is the Doppler Shift equation?',
    options: [
      'Doppler Shift = (2 * Blood Velocity * Transmitted Frequency * Cosine of angle) / Propagation Speed',
      'Doppler Shift = Propagation Speed / wavelength',
      'Doppler Shift = Frequency * Density',
      'Doppler Shift = PRF / 2'
    ],
    correctAnswer: 0,
    explanation: 'The Doppler Shift (Fd) is Fd = (2 * v * f0 * cos θ) / c, where v is velocity, f0 is transducer frequency, θ is angle of incidence, and c is propagation speed (1540 m/s).'
  },
  {
    id: 'up-q29',
    testId: 'test-physics-50',
    questionText: 'At which angle between the ultrasound beam path and blood flow direction is the detected Doppler shift at its absolute maximum?',
    options: ['90 degrees', '45 degrees', '0 or 180 degrees (parallel)', '60 degrees'],
    correctAnswer: 2,
    explanation: 'Since the Doppler shift is proportional to the cosine of the angle, it is greatest when flow is parallel to the beam (0° or 180° where cos is 1 or -1). Perpendicular flow (90°) yields a cos of 0 (no shift).'
  },
  {
    id: 'up-q30',
    testId: 'test-physics-50',
    questionText: 'What happens to the detected Doppler shift if blood flow is perpendicular (90 degrees) to the sound beam?',
    options: [
      'It is at its maximum positive level',
      'It is at its maximum negative level',
      'It is Zero (no shift is detected)',
      'It aliases to maximum limit'
    ],
    correctAnswer: 2,
    explanation: 'The cosine of 90 degrees is 0; therefore, no Doppler shift is detected when the beam is perpendicular to the motion axis.'
  },
  {
    id: 'up-q31',
    testId: 'test-physics-50',
    questionText: 'What is the Nyquist Limit in pulsed-wave Doppler?',
    options: ['PRF * 2', 'PRF / 2', 'Propagation Speed / 1540', 'Snell’s Limit'],
    correctAnswer: 1,
    explanation: 'The Nyquist Limit is the highest Doppler shift frequency that can be measured without aliasing, and is equal to exactly one-half of the Pulse Repetition Frequency (PRF / 2).'
  },
  {
    id: 'up-q32',
    testId: 'test-physics-50',
    questionText: 'Aliasing occurs when the detected Doppler shift frequency exceeds which threshold?',
    options: ['The transpulser limit', 'The Nyquist Limit (PRF / 2)', 'The absolute propagation speed in blood', 'The sound frequency coefficient'],
    correctAnswer: 1,
    explanation: 'Aliasing is a peak-waveform wrap-around artifact that occurs in Pulsed-Wave Doppler when the Doppler frequency shift exceeds the Nyquist Limit (PRF / 2).'
  },
  {
    id: 'up-q33',
    testId: 'test-physics-50',
    questionText: 'Which of the following actions will help to eliminate aliasing in spectral Doppler?',
    options: [
      'Increase the transducer frequency',
      'Increase the imaging depth',
      'Adjust baseline, increase PRF/scale, or use a lower-frequency transducer',
      'Increase acoustic power amplitude'
    ],
    correctAnswer: 2,
    explanation: 'To resolve aliasing: increase PRF (scale), lower the transducer frequency (reduces shift), use shallower views, shift the zero baseline, or switch to continuous-wave (CW) Doppler.'
  },
  {
    id: 'up-q34',
    testId: 'test-physics-50',
    questionText: 'What is a major advantage of Continuous Wave (CW) Doppler compared to Pulsed Wave (PW) Doppler?',
    options: [
      'Excellent range resolution and depth selection',
      'Ability to measure very high velocities without aliasing',
      'Narrower bandwidth matching indices',
      'Generates high resolution 2D grayscale anatomical images'
    ],
    correctAnswer: 1,
    explanation: 'Continuous Wave Doppler is constantly transmitting and receiving, thus there is no PRF limit and no aliasing occurs, allowing accurate tracking of very high blood velocities.'
  },
  {
    id: 'up-q35',
    testId: 'test-physics-50',
    questionText: 'Which acoustic artifact presents as a series of multiple, equally-spaced horizontal lines parallel to the sounding axis?',
    options: ['Posterior Acoustic Shadowing', 'Acoustic Enhancement', 'Reverberation', 'Mirror Image'],
    correctAnswer: 2,
    explanation: 'Reverberation occurs when sound bounces repeatedly between two strong parallel reflectors, presenting as multiple equally-spaced horizontal lines.'
  },
  {
    id: 'up-q36',
    testId: 'test-physics-50',
    questionText: 'posterior acoustic shadowing artifact is caused by which of the following?',
    options: [
      'A structure with extremely low attenuation',
      'An interface with extremely high attenuation or reflection (e.g., bone or calcification)',
      'Incorrect depth focus',
      'Aliasing of the receiver scale'
    ],
    correctAnswer: 1,
    explanation: 'Shadowing occurs when a highly attenuating structure (like bone or gallstone) absorbs or reflects almost all sound tissue energy, leaving a dark, echo-free column behind it.'
  },
  {
    id: 'up-q37',
    testId: 'test-physics-50',
    questionText: 'Acoustic enhancement (posterior enhancement) occurs behind structures with what characteristic?',
    options: [
      'Extremely high attenuation rates',
      'Very low attenuation rates (e.g., fluid-filled cysts)',
      'Highly irregular scattering surfaces',
      'Propagation speeds equal to steel'
    ],
    correctAnswer: 1,
    explanation: 'Enhancement occurs behind structures with low attenuation (like a simple cyst or bladder). Since little sound is attenuated in the fluid, the beam remains highly intense, creating a brighter region deeper down.'
  },
  {
    id: 'up-q38',
    testId: 'test-physics-50',
    questionText: 'Where does a mirror image artifact always place the false copy relative to the real structure?',
    options: [
      'Shallower than the actual structure',
      'Deeper than the actual structure, across a highly reflecting boundary',
      'Perfectly overlapping the real structure',
      'To the side of the screen as lateral noise'
    ],
    correctAnswer: 1,
    explanation: 'Mirror image occurs when sound bounces off a strong reflector (like the diaphragm) before hitting the target, placing the duplicate structure deeper on the display.'
  },
  {
    id: 'up-q39',
    testId: 'test-physics-50',
    questionText: 'What is the ALARA principle in clinical sonography diagnostic practices?',
    options: [
      'As Low As Reasonably Achievable (minimize patient exposure time and acoustic power)',
      'Adjust Lateral Amplitude for Resolving Artifacts',
      'Always Look At Regional Anatomy',
      'Acoustic Levels Are Regulated Automatically'
    ],
    correctAnswer: 0,
    explanation: 'ALARA stands for As Low As Reasonably Achievable. It dictates that acoustic exposure (power and scan time) should be kept at a minimum to achieve the necessary diagnostic info.'
  },
  {
    id: 'up-q40',
    testId: 'test-physics-50',
    questionText: 'Which thermal index (TI) setting is most appropriate when scanning obstetric / fetal tissues?',
    options: ['TI Brain (TIB)', 'TI Bone (TIB)', 'TI Soft Tissue (TIS)', 'TI Oblique (TIO)'],
    correctAnswer: 1,
    explanation: 'Fetal bones attenuate and absorb sound heavily. Therefore, TI Bone (TIB) is the safest index to monitor when scanning second or third trimester fetal tissues.'
  },
  {
    id: 'up-q41',
    testId: 'test-physics-50',
    questionText: 'Which function of the receiver compensates for the effects of sound attenuation at deeper depths?',
    options: ['Rejection', 'Compression', 'Time-Gain Compensation (TGC)', 'Demodulation'],
    correctAnswer: 2,
    explanation: 'Time-Gain Compensation (TGC) allows the operator to selectively amplify deeper signals to offset attenuation, creating a uniform brightness from top to bottom.'
  },
  {
    id: 'up-q42',
    testId: 'test-physics-50',
    questionText: 'What are the two distinct steps involved in Demodulation of an electrical signal?',
    options: [
      'Amplification and Compensation',
      'Rectification (converting negative voltages to positive) and Smoothing',
      'Compression and Rejection',
      'A/D conversion and pixel interpolation'
    ],
    correctAnswer: 1,
    explanation: 'Demodulation has two steps: Rectification (turning negative voltages into positive ones) and Smoothing/Integration (enveloping the signal to make it clean for the monitor).'
  },
  {
    id: 'up-q43',
    testId: 'test-physics-50',
    questionText: 'Which control adjusts the range of gray shades displayed on the ultrasound screen (contrast)?',
    options: ['Acoustic Power', 'Dynamic Range or Compression', 'Transducer Gain', 'Reject scale'],
    correctAnswer: 1,
    explanation: 'Dynamic range (compression) controls the ratio of maximum to minimum signal amplitudes. Reducing dynamic range yields a higher contrast (more black and white) image.'
  },
  {
    id: 'up-q44',
    testId: 'test-physics-50',
    questionText: 'Which type of zoom (magnification) is performed during live, real-time scanning?',
    options: ['Read Zoom', 'Write Zoom', 'Display Zoom', 'Pixel Zoom'],
    correctAnswer: 1,
    explanation: 'Write Zoom is a pre-processing function performed during active scanning. The system rescans the region of interest with higher line density, improving spatial resolution.'
  },
  {
    id: 'up-q45',
    testId: 'test-physics-50',
    questionText: 'How is the contrast resolution of a digital display system determined?',
    options: [
      'The transducer frequency',
      'The size of the matching layer',
      'The number of bits assigned to each pixel in memory',
      'The total frame rate'
    ],
    correctAnswer: 2,
    explanation: 'Contrast resolution represents the ability to distinguish similar shades of gray, and is determined by the number of bits per pixel in the scan converter memory (e.g., 8 bits = 256 shades).'
  },
  {
    id: 'up-q46',
    testId: 'test-physics-50',
    questionText: 'What is the standard unit of measurement of acoustic impedance?',
    options: ['Decibels (dB)', 'Rayls (Z)', 'Hertz (Hz)', 'Watts/cm²'],
    correctAnswer: 1,
    explanation: 'Acoustic impedance is measured in Rayls (represented by the letter Z), named after the British physicist Lord Rayleigh.'
  },
  {
    id: 'up-q47',
    testId: 'test-physics-50',
    questionText: 'Which physical effect describes the generation of electrical voltages when mechanical pressure is applied to a crystal?',
    options: ['Photoelectric Effect', 'Piezoelectric Effect', 'Doppler Effect', 'Snell’s Bending Effect'],
    correctAnswer: 1,
    explanation: 'The Piezoelectric Effect is the conversion of mechanical pressure (sound) into electrical charge (voltage) in active crystals. Reverse piezoelectric is voltage-to-sound.'
  },
  {
    id: 'up-q48',
    testId: 'test-physics-50',
    questionText: 'What is the temperature limit called above which a piezoelectric material permanently loses its polarization?',
    options: ['Curie Point', 'Snell Limit', 'Celsius Threshold', 'Kelvin Threshold'],
    correctAnswer: 0,
    explanation: 'The Curie Temperature (or Curie Point) is the limit. Forcing heating near or above this level depolarizes the PZT crystal, ruining the transducer.'
  },
  {
    id: 'up-q49',
    testId: 'test-physics-50',
    questionText: 'Which type of scattering occurs when the target reflector is much smaller than the ultrasound beam’s wavelength?',
    options: ['Specular Reflection', 'Rayleigh Scattering', 'Diffuse Backscatter', 'refraction refraction'],
    correctAnswer: 1,
    explanation: 'Rayleigh scattering occurs with structures much smaller than the beam wavelength (e.g., red blood cells), scattering sound equally in all directions (proportional to frequency^4).'
  },
  {
    id: 'up-q50',
    testId: 'test-physics-50',
    questionText: 'If you switch from a 3 MHz transducer to a 6 MHz transducer, what is the impact on Rayleigh scattering?',
    options: [
      'It remains unchanged',
      'It doubles',
      'It increases by 16 times',
      'It decreases to one-half'
    ],
    correctAnswer: 2,
    explanation: 'Rayleigh scattering is proportional to frequency raised to the 4th power (f^4). Since frequency doubled from 3 to 6 MHz, scattering increases by 2^4 = 16 times.'
  }
];
