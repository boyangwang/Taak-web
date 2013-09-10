# Tower Defense [Tentatively: Blob defense]

## Mechanics

There will be 7 kinds of blobs. Their defense are given below. Higher means less damage taken. Spawns indicate what additional blobs may be produced if the blob is taken out (if spawn mechanic used). Adjustments may be needed.

Resultant damage = Damage - Defense

			Fire	Elec	Water	Speed	Spawns
	Red: 	0		30		30		1		0
	Blue:	50		50		0		1		2x Red
	Yellow:	50		0		50		1		2x Blue 1x Red
	Purple:	30		90		30		2		1x Yellow 1x Blue 3x Red 
	Orange: 30		30		90		2		3x Yellow 3x Red
	Green:	90		30		30		2		3x Yellow 2x Blue
	Black:	50		50		50		2		1x Purple 1x Orange 1x Green
	White:	30		30		30		2		2x Black

All blobs assumed to have 100 health, but can be adjusted if needed.

Turrets

					Fire	Elec	Water	Cooldown	Range	Cost	Type
	Flame dart:		120		20		0		1			1		200		Projectile
	Cannon:			160		30		0		2			1.5		300		AoE
	Lightning rod:	50		180		0		2			1.5		300		AoE
	Water jet:		0		30		100		3			2		400		Projectile. Reduce movement by 0.5x
	Freezer:		0		30		140		3			1		500		AoE. Reduce movement by 0.5x
	Machine gunner:	100		100		0		0.2			3		2000	Projectile. Accessible in later stages.
	

## Currency

Currency to purchase turrets is called "gems".

20 gems are obtained for every slime kill.
Extra gems are awarded for round completion. 