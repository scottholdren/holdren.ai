---
layout: post
title: "Platesolving Without Domain Knowledge"
date: 2026-04-10
description: "Two different paths to solving the same plate-solving problem — one with domain expertise, one without."
---

My friend <a href="https://quietlife.net/2026/04/08/platesolving-for-fun-and-no-profit/">cwage</a> wrote about analyzing an Artemis II photo using plate solving—identifying which stars and celestial objects are visible in a photo of the Moon with the Sun behind it. His post documents how he used Claude Code to walk through the problem, hit a wall (the parity issue—FITS coordinate systems vs. JPEG coordinate systems), and then steered Claude through the solution once he recognized what was wrong.

I was curious - could I solve the same problem with Claude but no domain knowledge? I didn't know what parity was. I had never heard of plate solving. I just gave Claude the image and asked it to identify the 10 brightest celestial bodies and annotate the image. Here's what happened when I let Claude navigate completely blind.

<figure>
  <img src="/assets/posts/platesolving/art002e009301~large.jpg" alt="The original Artemis eclipse photo — the Moon surrounded by the Sun's corona, with faint stars scattered in the background.">
  <figcaption>The original image. Moon, corona, and a scattering of stars hiding in the glow.</figcaption>
</figure>

## The First 30+ Minutes of Local Solving

Claude's initial instinct was to build a plate solver from scratch. It used the skyfield library to compute where stars should be. It built custom scripts to detect bright spots in the image. It tried to match them against star catalogs using rotation scanning and source extraction.

For over 30 minutes, it kept iterating. It tried different extraction heuristics. It tested different FOV estimates. It rotated through different rotation angles. Nothing converged. It blamed the corona glow—that bright halo around the Moon—for contaminating every source extraction attempt. It fixed angular separation calculation bugs. It tried different Moon detection methods. It tweaked brightness thresholds.

Several times it asked me for additional context.  I told it I had nothing to go on except the photo.

Finally it presented a solution. Unfortunately it was incorrect, so I sent it back to work.

<figure>
  <img src="/assets/posts/platesolving/annotated_eclipse_v1.jpg" alt="Claude's first solve.">
  <figcaption>Claude's first solve. Nope.</figcaption>
</figure>

Eventually it admitted defeat: "I can't reliably plate-solve this with local tools."

That was honest. It was also the right call.

## The Astrometry.net Suggestion

At this point, Claude proposed a different approach: use `solve-field`, astrometry.net's local plate solver, with proper index files. It started downloading index files covering various scales. It tried running the solver on the original image. That didn't work—the corona confused it, and it guessed the wrong FOV. It tried on a masked image. That didn't work either.

Then Claude suggested something simpler: upload a masked version to nova.astrometry.net, the web service. It said: "Upload the masked image to http://nova.astrometry.net... It has all the index files and would solve this in minutes, giving you an exact WCS solution."

That sounded reasonable. I did it.

## The Masked Image Fails

<figure>
  <img src="/assets/posts/platesolving/masked_first_full.jpg" alt="Claude's first masking attempt — almost the entire frame is black. The stars have been masked out along with the corona.">
  <figcaption>Claude's original mask. Doomed from the start.</figcaption>
</figure>

I uploaded the masked image Claude had generated. nova.astrometry.net returned: <a href="https://nova.astrometry.net/user_images/15025640">job failed</a>.

Claude's response was straightforward: "That's unfortunate but not surprising — the corona glow probably defeated their source extractor too."

The mask had been too aggressive—gray > 35 as the glow threshold ended up masking almost everything, including the actual stars. It generated yet another improved masked version, this time just a black circle over the Moon/corona center with all the stars preserved.

<figure>
  <img src="/assets/posts/platesolving/masked_eclipse.jpg" alt="Claude's second masking attempt — almost the entire frame is black, with only a sliver of sky visible. The stars have been masked out along with the corona.">
  <figcaption>Claude's "improved" mask. Less aggressive — but still clearly struggling with the assignment.</figcaption>
</figure>


## I Skip the Iteration

Here's where I diverged: instead of uploading Claude's newly improved masked version, I just uploaded the original unmasked image to astrometry.net.

<a href="https://nova.astrometry.net/user_images/15025711">It worked</a>.

I got back a FITS WCS file with real coordinates: RA=8.4°, Dec=8.4°, pixel scale=106.5"/px, rotation=-173°, FOV=56.8°×37.9°.

The masking had never been necessary.

## Using the Real WCS

Now Claude had something concrete to work with. It used the WCS coordinates to identify where everything should be in the image.

It focused on the stars. It downloaded HD and HIP reference catalogs from astrometry.net. It fixed the star name lookups by cross-referencing positions instead of relying on a broken HIP ID table. It widened the peak detection radius to catch Hamal, which was just outside the measurement window. It fine-tuned the background estimation for bright stars.

The final output was 10 stars with proper names and labels in the right spots.

<figure>
  <img src="/assets/posts/platesolving/annotated_eclipse.jpg" alt="The final annotated eclipse photo with 10 bright stars labeled by name around the eclipsed Moon.">
  <figcaption>The final annotated result. Ten stars identified by name, each within a pixel of its catalog position.</figcaption>
</figure>

## The Contrast with Chris

Chris's approach was different. He recognized the parity problem—that JPEG images have their origin at the top-left with y pointing down, while FITS coordinate systems put the origin at the bottom-left with y pointing up. This flips the handedness of the coordinate system. He saw where Claude was heading with its manual rotation scanning and steered it away from that wall before it wasted hours discovering parity through trial and error.

I didn't see that wall coming. Instead I let Claude bang its head on the wall for a few hours. Eventually it suggested using external tools that required my input. I did what it asked and Claude was able to complete the rest.

Neither approach required expertise to solve the problem. But Chris's approach prevented wasted effort and stayed local. Mine required burning lots of tokens and eventually doing some legwork that Claude couldn't.


## What This Means

The real bottleneck for me wasn't the masking strategy or understanding coordinate system parity. It was having a reliable external reference—the WCS file from nova.astrometry.net. Claude knew it was there, but it defaulted to solving the problem locally. It seems Claude has a "Not Invented Here" bias, or it really didn't want to bother me.

Chris knew how to steer the solution early because he understood the domain. I stumbled into it by testing Claude's suggestion after exhausting all options.

Two different paths. Same destination. Different lessons.

