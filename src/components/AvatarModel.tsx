import { useGLTF, useAnimations, useFBX } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group, Audio as ThreeAudio } from 'three';
import { useBlinkAnimation } from '../hooks/useBlinkAnimation';
import { AvatarControls } from './AvatarControls';
import { useAvatarStore } from '../store/useAvatarStore';

export function AvatarModel() {
  const group = useRef<Group>(null);
  const audioRef = useRef<ThreeAudio>();
  
  // Load base model and animations
  const { scene, animations } = useGLTF('/models/64f1a714fe61576b46f27ca2.glb');
  const { animations: additionalAnimations } = useGLTF('/models/animations.glb');
  
  // Load FBX animations
  const talkingAnimation = useFBX('/animations/Talking_1.fbx');
  const angryAnimation = useFBX('/animations/Angry.fbx');
  const cryingAnimation = useFBX('/animations/Crying.fbx');
  const laughingAnimation = useFBX('/animations/Laughing.fbx');
  const terrifiedAnimation = useFBX('/animations/Terrified.fbx');
  const rumbaAnimation = useFBX('/animations/Rumba Dancing.fbx');
  const idleAnimation = useFBX('/animations/Standing Idle.fbx');

  // Combine all animations
  const allAnimations = [
    ...animations,
    ...additionalAnimations,
    ...talkingAnimation.animations.map(anim => ({ ...anim, name: 'talk1' })),
    ...angryAnimation.animations.map(anim => ({ ...anim, name: 'angry' })),
    ...cryingAnimation.animations.map(anim => ({ ...anim, name: 'cry' })),
    ...laughingAnimation.animations.map(anim => ({ ...anim, name: 'laugh' })),
    ...terrifiedAnimation.animations.map(anim => ({ ...anim, name: 'scared' })),
    ...rumbaAnimation.animations.map(anim => ({ ...anim, name: 'dance' })),
    ...idleAnimation.animations.map(anim => ({ ...anim, name: 'idle' }))
  ];

  const { actions } = useAnimations(allAnimations, group);
  const { audioUrl, visemeData, isPlaying, setIsPlaying } = useAvatarStore();
  const clonedScene = scene.clone();
  
  useBlinkAnimation(group);

  // Initial idle animation
  useEffect(() => {
    if (actions['idle']) {
      actions['idle'].reset().play();
    }
  }, [actions]);

  useEffect(() => {
    if (audioUrl && isPlaying) {
      const audioLoader = new ThreeAudio.AudioLoader();
      audioLoader.load(audioUrl, (buffer) => {
        if (audioRef.current) {
          audioRef.current.setBuffer(buffer);
          audioRef.current.play();
          audioRef.current.onEnded = () => setIsPlaying(false);
        }
      });
    }
  }, [audioUrl, isPlaying, setIsPlaying]);

  return (
    <>
      <group ref={group}>
        <primitive object={clonedScene} scale={2} position={[0, -2, 0]} />
      </group>
      <AvatarControls modelRef={group} actions={actions} />
    </>
  );
}