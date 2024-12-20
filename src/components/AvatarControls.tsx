import { useControls, button, folder } from 'leva';
import { useCallback } from 'react';
import { Group, SkinnedMesh, AnimationAction } from 'three';
import { facialExpressions } from '../data/facialExpressions';

interface AvatarControlsProps {
  modelRef: React.RefObject<Group>;
  actions: { [key: string]: AnimationAction };
}

export function AvatarControls({ modelRef, actions }: AvatarControlsProps) {
  const applyMorphTargets = useCallback((expressions: Record<string, number>) => {
    if (!modelRef.current) return;
    
    const headMesh = modelRef.current.children[0].children.find(
      child => child.name === 'Wolf3D_Head'
    ) as SkinnedMesh;

    if (!headMesh?.morphTargetDictionary || !headMesh?.morphTargetInfluences) {
      console.warn('Head mesh or morph targets not found');
      return;
    }

    headMesh.morphTargetInfluences.fill(0);

    Object.entries(expressions).forEach(([name, value]) => {
      const index = headMesh.morphTargetDictionary[name];
      if (index !== undefined) {
        headMesh.morphTargetInfluences[index] = value;
      }
    });
  }, [modelRef]);

  const playAnimation = useCallback((name: string) => {
    // Stop all current animations
    Object.values(actions).forEach(action => action.stop());
    
    // Play the selected animation
    if (actions[name]) {
      actions[name].reset().fadeIn(0.5).play();
      console.log(`Playing animation: ${name}`); // Debug log
    } else {
      console.warn(`Animation "${name}" not found`); // Debug log
    }
  }, [actions]);

  useControls({
    Animations: folder({
      'Idle': button(() => playAnimation('idle')),
      'Dancing': button(() => playAnimation('dance')),
      'Talk': button(() => playAnimation('talk1')),
      'Angry': button(() => playAnimation('angry')),
      'Crying': button(() => playAnimation('cry')),
      'Laughing': button(() => playAnimation('laugh')),
      'Scared': button(() => playAnimation('scared')),
    }),
    Expressions: folder({
      'Reset': button(() => applyMorphTargets({})),
      'Smile': button(() => applyMorphTargets(facialExpressions.smile)),
      'Funny Face': button(() => applyMorphTargets(facialExpressions.funnyFace)),
      'Sad': button(() => applyMorphTargets(facialExpressions.sad)),
      'Surprised': button(() => applyMorphTargets(facialExpressions.surprised)),
      'Angry': button(() => applyMorphTargets(facialExpressions.angry)),
      'Crazy': button(() => applyMorphTargets(facialExpressions.crazy)),
    })
  });

  return null;
}