---
layout: post
title: "Platesolving Without Domain Knowledge"
date: 2026-04-10
description: "Two different paths to solving the same plate-solving problem — one with domain expertise, one without."
---

My friend Chris wrote about solving an Artemis eclipse photo using plate solving—identifying which stars and celestial objects are visible in a photo of the Moon with the Sun behind it. His post documents how he used Claude Code to walk through the problem, hit a wall (the parity issue—FITS coordinate systems vs. JPEG coordinate systems), and then steered Claude through the solution once he recognized what was wrong.

I solved the same problem differently. I didn't know what parity was. I didn't know anything about plate solving. I just gave Claude the image and asked it to identify the 10 brightest celestial bodies (excluding the Moon), label them by type, and annotate the image. Here's what happened when I let Claude navigate completely blind.

## The First 30+ Minutes of Local Solving

Claude's initial instinct was to build a plate solver from scratch. It used the skyfield library to compute where planets should be. It built custom scripts to detect bright spots in the image. It tried to match them against star catalogs using rotation scanning and source extraction.

For over 30 minutes, it kept iterating. It tried different extraction heuristics. It tested different FOV estimates. It rotated through different rotation angles. Nothing converged. The corona glow—that bright halo around the Moon—contaminated every source extraction attempt. Claude fixed angular separation calculation bugs. It tried different Moon detection methods. It tweaked brightness thresholds. Eventually it admitted defeat: "I can't reliably plate-solve this with local tools."

That was honest. It was also the right call.

## The Astrometry.net Suggestion

At this point, Claude proposed a different approach: use `solve-field`, astrometry.net's local plate solver, with proper index files. It started downloading index files covering various scales. It tried running the solver on the original image. That didn't work—the corona confused it. It tried on a masked image. That didn't work either.

Then Claude suggested something simpler: upload a masked version to nova.astrometry.net, the web service. It said: "Upload the masked image to http://nova.astrometry.net... It has all the index files and would solve this in minutes, giving you an exact WCS solution."

That sounded reasonable. I did it.

## The Masked Image Fails

I uploaded the masked image Claude had generated. nova.astrometry.net returned: job failed.

Claude's response was straightforward: "That's unfortunate but not surprising — the corona glow probably defeated their source extractor too."

Then it suggested: try the original unmasked image instead. But before I could test that, Claude tried to fix the masking itself—it generated what it thought was a better masked version, still targeting astrometry.net.

I looked at what Claude produced and said: "Your masking job just came out as a black file. There's no stars apparent in there at all."

Claude acknowledged the bug. The mask had been too aggressive—gray > 35 as the glow threshold ended up masking almost everything, including the actual stars. It generated yet another improved masked version, this time just a black circle over the Moon/corona center with all the stars preserved.

## You Skip the Iteration

Here's where I diverged: instead of uploading Claude's newly improved masked version, I just uploaded the original unmasked image to astrometry.net.

It worked.

I got back a FITS WCS file with real coordinates: RA=8.4°, Dec=8.4°, pixel scale=106.5"/px, rotation=-173°, FOV=56.8°×37.9°.

The masking had never been necessary.

## Using the Real WCS

Now Claude had something concrete to work with. It used the WCS coordinates to identify where everything should be in the image. It discovered that Mercury, Saturn, and Mars were all present but buried in the corona glow—detectable in theory, but too faint to extract as sources.

It focused on the stars instead. It downloaded HD and HIP reference catalogs from astrometry.net. It fixed the star name lookups by cross-referencing positions instead of relying on a broken HIP ID table. It widened the peak detection radius to catch Hamal, which was just outside the measurement window. It fine-tuned the background estimation for bright stars.

The final output was 10 stars with proper names, pixel-perfect accuracy.

## The Contrast with Chris

Chris's approach was different. He recognized the parity problem—that JPEG images have their origin at the top-left with y pointing down, while FITS coordinate systems put the origin at the bottom-left with y pointing up. This flips the handedness of the coordinate system. He saw where Claude was heading with its manual rotation scanning and steered it away from that wall before it wasted hours discovering parity through trial and error.

I didn't see that wall coming. Claude suggested astrometry.net, I tested it with a masked image, it failed, and instead of waiting for Claude to iterate on the masking, I just uploaded the original and moved on.

Neither approach required expertise to solve the problem. But Chris's approach prevented wasted effort. Mine required testing a dead end, recognizing it was dead, and pivoting faster than Claude's own iteration loop.

## What This Means

The real bottleneck wasn't the masking strategy or understanding coordinate system parity. It was having a reliable external reference—the WCS file from nova.astrometry.net. Once that existed, everything else was just bookkeeping.

Chris knew to get that reference early because he understood the domain. I stumbled into it by testing Claude's suggestion, rejecting it when it failed, and moving on.

Two different paths. Same destination. Different lessons.

If you know the domain, you can prevent walls before you hit them. If you don't, you can still solve the problem—but you have to be willing to test fast, validate your results, and reject dead ends before they consume hours of iteration.

That second skill matters more than you'd think, especially when working with an AI that's happy to keep iterating on the wrong approach as long as you let it.
