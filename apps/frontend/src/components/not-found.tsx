import type { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from './ui/button'
import { TextHoverEffect } from './ui/text-hover-effect'

type NotFoundProps = {
  children?: ReactNode
}

export const NotFound: FC<NotFoundProps> = () => {
  const navigate = useNavigate()
  return (
    <div className='relative flex h-screen flex-1 flex-col items-center justify-center'>
      <div className='max-h-130'>
        <TextHoverEffect text='404' />
      </div>

      <div className='w-full text-center'>
        <p className='text-muted-foreground'>
          Ooopsss sorry, we can't find what you're looking for
        </p>
        <Button variant='outline' onClick={() => navigate(-1)}>
          Back to previous page
        </Button>
      </div>
    </div>
  )
}
