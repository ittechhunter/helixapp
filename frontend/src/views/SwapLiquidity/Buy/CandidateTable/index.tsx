import React, { useRef } from 'react'
import styled from 'styled-components'
import CandidateRow from './CandidateRow'

const StyledTable = styled.div`
  border-radius: ${({ theme }) => theme.radii.card};
  scroll-margin-top: 64px;
  > div:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
  }
`

const StyledTableBorder = styled.div`
  border-radius: ${({ theme }) => theme.radii.card};
  background: rgba(249, 250, 250, 0.08);
  backdrop-filter: blur(80px);
  background-size: 400% 400%;
`

const CandidateTable = (props) => {
  const { swap, buyer } = props
  const tableWrapperEl = useRef<HTMLDivElement>(null)
  if (!swap) return null
  if (swap.bidIds.length === 0) return <h3 style={{ textAlign: 'center', color: 'white' }}>No bids</h3>

  return (
    <StyledTableBorder>
      <StyledTable id="pools-table" role="table" ref={tableWrapperEl}>
        {swap.bidIds.map((bidId) => (
          <CandidateRow key={bidId} bidId={bidId} swapData={swap} buyer={buyer} />
        ))}
      </StyledTable>
    </StyledTableBorder>
  )
}
export default CandidateTable
